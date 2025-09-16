using Azure;
using Azure.AI.Agents.Persistent;
using Azure.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.Agents.AzureAI;
using Microsoft.SemanticKernel.ChatCompletion;
using ModelContextProtocol.Server;
using System.ComponentModel;

[McpServerToolType]
public class LearnTool
{
    private Kernel _kernel;
    private IConfiguration _config;

    public LearnTool(Kernel kernel, IConfiguration configuration)
    {
        _kernel = kernel;
        _config = configuration;
    }

    [McpServerTool]
    [KernelFunction("get_learn_content")]
    [Description("retrieve documentation from Microsoft Learn for a given Azure resource")]
    public async Task<string> GetLearnContentAsync(string subject)
    {
        Console.WriteLine($"--- Learn Tool Invoked {subject} ---");

        string retValue = string.Empty;
        string project = _config["AzureOpenAI:FoundryProject"]!;
        string bingConnectionId = _config["AzureOpenAI:BingConnectionId"]!;
        string modelDeploymentName = _config["AzureOpenAI:ModelDeploymentName"] ?? "gpt-4.1";

        PersistentAgentsClient agentClient = new(project, new DefaultAzureCredential());

        // Create the Agent
        AzureAIAgent agent = await CreateAgentAsync(agentClient, bingConnectionId);

        AzureAIAgentThread agentThread = new(agent.Client);
        try
        {
            ChatMessageContent message = new(AuthorRole.User, subject);
            await foreach (ChatMessageContent response in agent.InvokeAsync(message, agentThread))
            {
                retValue += response.Content;
            }
        }
        finally
        {
            await agentThread.DeleteAsync();
            await agentClient.Administration.DeleteAgentAsync(agent.Id);
        }
        return retValue;
    }

    private async Task<AzureAIAgent> CreateAgentAsync(PersistentAgentsClient agentsClient, string bingConnectionId)
    {
        string instructions = """
            You are tasked with searching Microsoft Learn documentation to gather comprehensive information regarding a specified Azure service such as "azure blob".
            Your search should collect all relevant Microsoft Learn content and organize the results into clearly defined sections such as Security, Redundancy, Performance, Certifications, Controls, bicep and others as applicable.
            Ensure that each section includes proper references and citations from Microsoft Learn so that a holistic document can be crafted based on the findings.
            If there's more information available, continue to search and add to the document.
        """;

        BingGroundingToolDefinition bingGroundingTool = new(
            new BingGroundingSearchToolParameters(
                [new BingGroundingSearchConfiguration(bingConnectionId)]
            )
        );


        // 1. Define an agent on the Azure AI agent service
        PersistentAgent definition = await agentsClient.Administration.CreateAgentAsync(
            "gpt-4o",
            name: "bingagent",
            description: "bingagent",
            instructions: instructions,
            tools: [bingGroundingTool]);

        // 2. Create a Semantic Kernel agent based on the agent definition
        AzureAIAgent agent = new(definition, agentsClient);

        return agent;
    }
}
