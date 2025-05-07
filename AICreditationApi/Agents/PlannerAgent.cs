using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.Agents;
using Microsoft.SemanticKernel.Connectors.OpenAI;

namespace AICreditationApi.Agents;

public class PlannerAgent
{
    public ChatCompletionAgent CreateAgent(Kernel kernel, string Topic, string agentName)
    {
        // Clone kernel instance to allow for agent specific plug-in definition
        Kernel agentKernel = kernel.Clone();
      

        // Import plug-in from type
        agentKernel.ImportPluginFromType<PlanTool>();
        agentKernel.ImportPluginFromType<TemplateTool>();
        agentKernel.ImportPluginFromType<LearnTool>();


        // Create the agent
        return
            new ChatCompletionAgent()
            {
                Name = agentName,
                Instructions = $"""
                    Formatting re-enabled
                    You are orchestrator to make sure all the neccesary information is gathered to write a Service Acreditation Document for {Topic}.
                    In essence you are a project manager that is responsible for the overall process of writing the document.
                    You in the Dutch Language.
                    This is the plan you need to follow:
                    - Retrieve the current data to update the change history (get_current_date)
                    - Retrieve the neccesary information about the service you need to write a document about (get_learn_content)
                    - Get a template for the Service Acreditation Document (get_document_template)
                    - Write an implementation guide that adheres to the compliance rules
                    - For every design decision, provide a justification *IMPORTANT*
                    - Finally add an example of a bicep template in the "Templates / Scripts" section that implements the design decision and adheres to the compliance rules
                    - Reiterate a few times, think hard and follow the plan.

                    IMPORTANT: 
                    Make sure to use the template tool to fill out the sections and maintain the structure. 

                    If you think you need more information (get_learn_content)
                    If you think you need to refine the document (get_document_template)
                    If you need the current date to update the change history (get_current_date)

                    Take at least 10 iterations to write the document.

                """,
                Kernel = agentKernel,
                Arguments = new KernelArguments(
                    new OpenAIPromptExecutionSettings()
                    {
                        //FunctionChoiceBehavior = FunctionChoiceBehavior.Auto(),
                        ToolCallBehavior = ToolCallBehavior.AutoInvokeKernelFunctions,
                        ServiceId = "o3mini"
                    })
            };
    }
}
