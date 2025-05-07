using Azure;
using Azure.AI.Projects;
using Azure.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.Agents.AzureAI;
using Microsoft.SemanticKernel.ChatCompletion;
using ModelContextProtocol.Server;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

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
        AIProjectClient client = AzureAIAgent.CreateAzureAIClient(project, new AzureCliCredential());
        AgentsClient agentsClient = client.GetAgentsClient();

        var agent = await CreateAgentAsync(client, agentsClient, bingConnectionId);

        var agentThread = new AzureAIAgentThread(agentsClient);
        try
        {

            ChatMessageContent message = new(AuthorRole.User, subject);
            await foreach (ChatMessageContent response in agent.InvokeAsync(message, agentThread))
            {
                retValue = response.Content!;
            }
            
        }
        finally
        {
            await agentThread.DeleteAsync();
            await agentsClient.DeleteAgentAsync(agent.Id);
     
        }

        return retValue;
    }

    private async Task<AzureAIAgent> CreateAgentAsync(AIProjectClient projectClient, AgentsClient agentsClient, string bingConnectionId)
    {

        string instructions = """
            You are tasked with searching Microsoft Learn documentation to gather comprehensive information regarding a specified Azure service such as "azure blob".
            Your search should collect all relevant Microsoft Learn content and organize the results into clearly defined sections such as Security, Redundancy, Performance, Certifications, Controls, bicep and others as applicable.
            Ensure that each section includes proper references and citations from Microsoft Learn so that a holistic document can be crafted based on the findings.
            If there's more information available, continue to search and add to the document.
        """;

        var bingConnection = await projectClient.GetConnectionsClient().GetConnectionAsync(bingConnectionId);
        var connectionId = bingConnection.Value.Id;

        AgentsClient agentClient = projectClient.GetAgentsClient();

        ToolConnectionList connectionList = new ToolConnectionList
        {
            ConnectionList = { new ToolConnection(connectionId) }
        };
        BingGroundingToolDefinition bingGroundingTool = new BingGroundingToolDefinition(connectionList);

        Agent definition = await agentClient.CreateAgentAsync(
            model: "gpt-4o",
            name: "my-assistant",
            instructions: instructions,
            tools: new List<ToolDefinition> { bingGroundingTool });

        AzureAIAgent agent = new(definition, agentClient);

        return agent;
    }
}
