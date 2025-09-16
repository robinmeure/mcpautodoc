using AICreditationApi.Agents;
using AICreditationApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Azure;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.Agents;
using Microsoft.SemanticKernel.Agents.Chat;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.SemanticKernel.Connectors.AzureOpenAI;
using Microsoft.SemanticKernel.Connectors.OpenAI;
using OpenAI.Chat;
using System.Runtime;
using System.Text.Json;
using System.Threading;
using ChatMessageContent = Microsoft.SemanticKernel.ChatMessageContent;

namespace AICreditationApi.Controllers;
[Route("api/[controller]")]
[ApiController]
public class ServiceAccreditationsController : ControllerBase
{
    private readonly ILogger<ServiceAccreditationsController> _logger;
    private Kernel _kernel;

    public ServiceAccreditationsController(ILogger<ServiceAccreditationsController> logger, Kernel kernel)
    {
        _logger = logger;
        _kernel = kernel;
    }

    [HttpPost()]
    [Produces("text/event-stream")]
    [Consumes("application/json")]
    public async Task GenerateAccreditation(ServiceAccreditationRequest req)
    {
        try
        {
            // Setup agents
            (string plannerName, string compliancyName, AgentGroupChat chat) = SetupAgents(req.Topic);

            // Start the conversation with the initial user request
            string taskToAchieve = $"Write a Service Acreditation Document on {req.Topic}";
            chat.AddChatMessage(new ChatMessageContent(AuthorRole.User, taskToAchieve));

            // Process the chat conversation and stream responses
            string finalResponse = await ProcessChatConversationAsync(chat, plannerName);

            // Generate the final document
            var finalDocument = await PrepareDocumentAsync(req.Topic, finalResponse);

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during document generation");
        }
    }

    private (string PlannerName, string CompliancyName, AgentGroupChat Chat) SetupAgents(string topic)
    {
        string plannerName = "Planner";
        string compliancyName = "CompliancyOfficer";

        ChatCompletionAgent planner = new PlannerAgent().CreateAgent(_kernel, topic, plannerName);
        ChatCompletionAgent compliancy = new CompliancyOfficer().CreateAgent(_kernel, topic, compliancyName);

        ChatHistoryTruncationReducer historyReducer = new(1);
        const string TerminationToken = "yes";

        KernelFunction selectionFunction = AgentGroupChat.CreatePromptFunctionForStrategy(
            $$$"""
        Examine the provided RESPONSE and choose the next participant.
        State only the name of the chosen participant without explanation.
        Never choose the participant named in the RESPONSE.

        Choose only from these participants:
        - {{{compliancyName}}}
        - {{{plannerName}}}

        Always follow these rules when choosing the next participant:
        - If RESPONSE is by {{{compliancyName}}}, it is {{{plannerName}}}'s turn.
        - If RESPONSE is by {{{plannerName}}}, it is {{{compliancyName}}}'s turn.

        RESPONSE:
        {{$lastmessage}}
        """,
            safeParameterNames: "lastmessage");

        KernelFunction terminationFunction = AgentGroupChat.CreatePromptFunctionForStrategy(
            $$$"""
        Examine the RESPONSE and determine whether the content has been deemed satisfactory.
        If content is satisfactory, respond with a single word without explanation: {{{TerminationToken}}}.
        If specific suggestions are being provided, it is not satisfactory.
        If no correction is suggested, it is satisfactory.

        RESPONSE:
        {{$lastmessage}}
        """,
            safeParameterNames: "lastmessage");

        // Configure the chat with strategies
        AgentGroupChat chat = new(planner, compliancy)
        {
            ExecutionSettings = new AgentGroupChatSettings
            {
                SelectionStrategy = new KernelFunctionSelectionStrategy(selectionFunction, _kernel)
                {
                    InitialAgent = planner,
                    //HistoryReducer = historyReducer,
                    HistoryVariableName = "lastmessage",
                    ResultParser = (result) => result.GetValue<string>() ?? compliancy.Name,
                    Arguments = new KernelArguments(
                        new OpenAIPromptExecutionSettings()
                        {
                            FunctionChoiceBehavior = FunctionChoiceBehavior.Auto(),
                            ServiceId = "o3mini"
                        })
                },
                TerminationStrategy = new KernelFunctionTerminationStrategy(terminationFunction, _kernel)
                {
                    Agents = [compliancy],
                    HistoryVariableName = "lastmessage",
                    MaximumIterations = 5,
                    ResultParser = (result) => result.GetValue<string>()?.Contains(TerminationToken, StringComparison.OrdinalIgnoreCase) ?? false,
                    Arguments = new KernelArguments(
                        new OpenAIPromptExecutionSettings()
                        {
                            FunctionChoiceBehavior = FunctionChoiceBehavior.Auto(),
                            ServiceId = "o3mini"
                        })
                }
            }
        };

        return (plannerName, compliancyName, chat);
    }

    private async Task ProcessStreamAsync(
           IAsyncEnumerable<StreamingChatMessageContent> stream
           )
    {

        var completions = new List<ChatMessageCompletion>();
        ChatMessageCompletion? currentCompletion = null;

        await foreach (var chatResponse in stream)
        {
            // Handle system messages (e.g., status updates) separately.
            // These are for client-side display only and are not saved.
            if (chatResponse.Role == AuthorRole.System)
            {
                var systemPayload = new { type = "system_message", role = "system", content = chatResponse.Content, final = false };
                string payload = System.Text.Json.JsonSerializer.Serialize(systemPayload);
                await Response.WriteAsync($"data: {payload}\n\n");
                await Response.Body.FlushAsync();
                continue; // Skip further processing for system messages.
            }

            // A new author indicates a new completion turn.
            if (currentCompletion == null || currentCompletion.AuthorName != chatResponse.AuthorName)
            {
                currentCompletion = new ChatMessageCompletion { AuthorName = chatResponse.AuthorName, Id = Guid.NewGuid().ToString() };
                completions.Add(currentCompletion);
            }

            // Part 1: Handle Function Call Updates
            if (chatResponse.Items.OfType<StreamingFunctionCallUpdateContent>().FirstOrDefault() is { } functionCallUpdate)
            {
                // Simplified logic to capture and send function calls.
                // This part can be expanded to handle streaming arguments if needed.
                var functionCallData = new Dictionary<string, object>
                {
                    ["name"] = functionCallUpdate.Name,
                    ["arguments"] = functionCallUpdate.Arguments
                };
                currentCompletion.FunctionCalls.Add(functionCallData);

                string functionPayload = System.Text.Json.JsonSerializer.Serialize(new
                {
                    type = "function_call",
                    functionCall = functionCallData,
                    final = false
                });
                await Response.WriteAsync($"data: {functionPayload}\n\n");
                await Response.Body.FlushAsync();
            }

            // Part 2: Handle Text Content Updates
            if (!string.IsNullOrEmpty(chatResponse.Content))
            {
                currentCompletion.Content += chatResponse.Content;

                object messagePayload = chatResponse.AuthorName != null
                    ? new { type = "agent_message", role = "assistant", content = chatResponse.Content, agent = chatResponse.AuthorName, id = currentCompletion.Id, final = false }
                    : new { type = "assistant_message", role = "assistant", content = chatResponse.Content, id = currentCompletion.Id, final = false };

                string payload = System.Text.Json.JsonSerializer.Serialize(messagePayload);
                await Response.WriteAsync($"data: {payload}\n\n");
                await Response.Body.FlushAsync();
            }
        }

        // Part 4: Finalize and Save all collected completions
        if (completions.Any())
        {
            await SendFinalMessageAsync(completions);
        }
    }

    private async Task SendFinalMessageAsync(
            List<ChatMessageCompletion> completions)
    {
        // The final user-facing content is the content of the last completion.
        var finalCompletion = completions.LastOrDefault();
        var finalContent = finalCompletion?.Content ?? string.Empty;

        // Send the final payload to the client.
        string finalPayload = System.Text.Json.JsonSerializer.Serialize(new
        {
            role = "assistant",
            content = finalContent,
            final = true
        });
        await Response.WriteAsync($"data: {finalPayload}\n\n");
        await Response.Body.FlushAsync();
    }

    private async Task<string> ProcessChatConversationAsync(AgentGroupChat chat, string plannerName)
    {
        // Invoke agents and stream responses
        await ProcessStreamAsync(chat.InvokeStreamingAsync());

        // Process and return final result
        if (!chat.IsComplete)
        {
            return string.Empty;
        }


        // Get complete chat history
        List<ChatMessageContent> messages = new();
        await foreach (ChatMessageContent response in chat.GetChatMessagesAsync())
        {
            messages.Add(response);
        }

        // Get last planner message as the final response
        var lastPlannerMessage = messages
            .Where(m => m.AuthorName == plannerName)
            .Select(m => m.Content)
            .FirstOrDefault();

        return lastPlannerMessage ?? string.Empty;
    }

    private async Task<ServiceAccreditationDocument> PrepareDocumentAsync(string topic, string input)
    {
        ServiceAccreditationDocument serviceAccreditationDocument = new();

        try
        {
            var _chatCompletionService = _kernel.GetRequiredService<IChatCompletionService>("gpt4o");
            var executionSettings = new AzureOpenAIPromptExecutionSettings
            {
                ModelId = "gpt-4o",
                ResponseFormat = typeof(ServiceAccreditationDocument),
            };

            string systemPrompt = $"" +
                $"Given the following input: {input}" +
                $"Your job is to reformat this to the following JSON object." +
                $"Keep the structure you were given from the original intact and don't leave anything out. " +
                $"Topic, Document, Comments. " +
                $"The Document property should contain the entire document in Markdown format and starts and ends with the following character sequence '---', " +
                $"The Comments property should contain any comments or notes you have about the document. " +
                $"The Topic property should contain the topic of the document.";

            var history = new ChatHistory()
        {
            new ChatMessageContent(AuthorRole.System, systemPrompt),
        };


            var chatResponse = await _chatCompletionService.GetChatMessageContentsAsync(
                                   executionSettings: executionSettings,
                                   chatHistory: history,
                                   kernel: _kernel);

            string response = string.Empty;
            foreach (var message in chatResponse)
            {
                response += message.Content;
            }

            serviceAccreditationDocument = JsonSerializer.Deserialize<ServiceAccreditationDocument>(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error formatting document");
        }

        return serviceAccreditationDocument;
    }
}
public class ServiceAccreditationDocument
{
    public string Topic { get; set; }
    public string Document { get; set; }
    public string Comments { get; set; }
}

public class ChatMessageCompletion
{
    public string Id { get; set; } = string.Empty;
    public string AuthorRole { get; set; } = "assistant";
    public string? AuthorName { get; set; }
    public string Content { get; set; } = string.Empty;
    //public UsageMetrics Usage { get; set; } = new();
    public List<Dictionary<string, object>> FunctionCalls { get; set; } = new();
}
sealed class ApprovalTerminationStrategy : TerminationStrategy
{
    // Terminate when the final message contains the term "approve"
    protected override Task<bool> ShouldAgentTerminateAsync(Microsoft.SemanticKernel.Agents.Agent agent, IReadOnlyList<ChatMessageContent> history, CancellationToken cancellationToken)
        => Task.FromResult(history[history.Count - 1].Content?.Contains("##APPROVE###", StringComparison.OrdinalIgnoreCase) ?? false);
}