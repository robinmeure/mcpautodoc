using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.Agents;
using Microsoft.SemanticKernel.Connectors.OpenAI;

namespace AICreditationApi.Agents;

public class AzureServiceExpert
{
    public ChatCompletionAgent CreateAgent(Kernel kernel, string Topic, string agentName)
    {
        // Clone kernel instance to allow for agent specific plug-in definition
        Kernel agentKernel = kernel.Clone();

        // Import plug-in from type
        agentKernel.ImportPluginFromType<LearnTool>();

       
        // Create the agent
        return
            new ChatCompletionAgent()
            {
                Name = agentName,
                Instructions = $"""

                    You are an expert on {Topic} and you are tasked 
                    with searching Microsoft Learn documentation to gather 
                    comprehensive information regarding {Topic}".

                    Don't try to write a document, just provide technical information
                    to the writer.

                """,
                Kernel = agentKernel,
                Arguments = new KernelArguments(
                    new OpenAIPromptExecutionSettings()
                    {
                        FunctionChoiceBehavior = FunctionChoiceBehavior.Required()
                    })
                
                
            };
    }
}
