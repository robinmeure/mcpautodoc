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
using System.Runtime;
using System.Text.Json;

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
        // Setup response headers for streaming
        SetupEventStreamHeaders();

        try
        {
            // Send initialization message
            await SendEventStreamMessage(new { status = "initializing", message = "Starting document generation..." });

            // Setup agents
            (string plannerName, string compliancyName, AgentGroupChat chat) = await SetupAgentsAsync(req.Topic);

            // Send setup complete message
            await SendEventStreamMessage(new { status = "setup_complete", message = "Agents initialized and ready" });

            // Start the conversation with the initial user request
            string taskToAchieve = $"Write a Service Acreditation Document on {req.Topic}";
            chat.AddChatMessage(new ChatMessageContent(AuthorRole.User, taskToAchieve));

            // Process the chat conversation and stream responses
            string finalResponse = await ProcessChatConversationAsync(chat, plannerName);

            // Send processing complete message
            await SendEventStreamMessage(new { status = "processing_complete", message = "Chat conversation completed" });

            // Generate the final document
            var finalDocument = await PrepareDocumentAsync(req.Topic, finalResponse);

            // Send final document
            await SendEventStreamMessage(new { status = "complete", final = true, document = finalDocument });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during document generation");
            await SendEventStreamMessage(new { status = "error", error = true, message = ex.Message });
        }
    }

    private void SetupEventStreamHeaders()
    {
        Response.Headers.Append("Content-Type", "text/event-stream");
        Response.Headers.Append("Cache-Control", "no-cache");
        Response.Headers.Append("Connection", "keep-alive");
    }

    private async Task SendEventStreamMessage(object data)
    {
        await Response.WriteAsync($"data: {JsonSerializer.Serialize(data)}\n\n");
        await Response.Body.FlushAsync();
    }

    private async Task<(string PlannerName, string CompliancyName, AgentGroupChat Chat)> SetupAgentsAsync(string topic)
    {
        string plannerName = "Planner";
        string compliancyName = "CompliancyOfficer";

        // Send progress update
        await SendEventStreamMessage(new { status = "creating_agents", message = "Creating AI agents..." });

        ChatCompletionAgent planner = new PlannerAgent().CreateAgent(_kernel, topic, plannerName);
        ChatCompletionAgent compliancy = new CompliancyOfficer().CreateAgent(_kernel, topic, compliancyName);

        // Send progress update
        await SendEventStreamMessage(new { status = "configuring_chat", message = "Configuring conversation parameters..." });

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

    private async Task<string> ProcessChatConversationAsync(AgentGroupChat chat, string plannerName)
    {
        // Send heartbeat to keep connection alive
        await SendEventStreamMessage(new { status = "conversation_starting", message = "Starting AI conversation..." });

        int messageCounter = 0;
        DateTime lastHeartbeat = DateTime.UtcNow;
        const int HeartbeatIntervalSeconds = 10;

        // Invoke agents and stream responses
        await foreach (ChatMessageContent response in chat.InvokeAsync())
        {
            messageCounter++;
            _logger.LogInformation($"{response.AuthorName}: {response.Content}");

            // Send actual message
            await SendEventStreamMessage(new
            {
                status = "message",
                messageId = messageCounter,
                author = response.AuthorName,
                content = response.Content,
                timestamp = DateTime.UtcNow
            });

            // Send heartbeat if needed to keep connection alive
            var now = DateTime.UtcNow;
            if ((now - lastHeartbeat).TotalSeconds > HeartbeatIntervalSeconds)
            {
                await SendEventStreamMessage(new { status = "heartbeat", timestamp = now });
                lastHeartbeat = now;
            }
        }

        // Process and return final result
        if (!chat.IsComplete)
        {
            await SendEventStreamMessage(new { status = "warning", message = "Chat did not complete normally" });
            return string.Empty;
        }

        await SendEventStreamMessage(new { status = "collating_results", message = "Collecting final results..." });

        // Get complete chat history
        List<ChatMessageContent> messages = new();
        await foreach (ChatMessageContent response in chat.GetChatMessagesAsync())
        {
            messages.Add(response);

            // Send heartbeat if needed
            var now = DateTime.UtcNow;
            if ((now - lastHeartbeat).TotalSeconds > HeartbeatIntervalSeconds)
            {
                await SendEventStreamMessage(new { status = "heartbeat", timestamp = now });
                lastHeartbeat = now;
            }
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
        await SendEventStreamMessage(new { status = "formatting_document", message = "Formatting final document..." });

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

            await SendEventStreamMessage(new { status = "generating_final_document", message = "Finalizing document format..." });

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
            await SendEventStreamMessage(new { status = "document_error", message = $"Error formatting document: {ex.Message}" });
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


sealed class ApprovalTerminationStrategy : TerminationStrategy
{
    // Terminate when the final message contains the term "approve"
    protected override Task<bool> ShouldAgentTerminateAsync(Microsoft.SemanticKernel.Agents.Agent agent, IReadOnlyList<ChatMessageContent> history, CancellationToken cancellationToken)
        => Task.FromResult(history[history.Count - 1].Content?.Contains("##APPROVE###", StringComparison.OrdinalIgnoreCase) ?? false);
}