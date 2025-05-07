using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.Agents;
using Microsoft.SemanticKernel.Connectors.OpenAI;

namespace AICreditationApi.Agents;

public class CompliancyOfficer
{
    public ChatCompletionAgent CreateAgent(Kernel kernel, string Topic, string agentName)
    {
        // Clone kernel instance to allow for agent specific plug-in definition
        Kernel agentKernel = kernel.Clone();

        return
            new ChatCompletionAgent()
            {
                Name = agentName,
                Instructions = $"""

                   You are responsible for approving or rejecting the document based on
                    - the compliance rules that apply to the given topic {Topic}
                    - the technical documentation provided by the writer
                    - the structure of the document adheres to the template
                    - the completeness of the document

                    Be aware that you are representing a goverment agency and you are responsible for the quality of the document and it should adhere to the most secure and compliant standards.

                    If this is the first iteration, always answer no and provide valid feedback to improve the document.

                    If you feel the document is not complete, please provide feedback to the writer
                    If you feel the document is complete, please approve the document with 'yes'

                """,
                Kernel = agentKernel,
                Arguments = new KernelArguments(
                    new OpenAIPromptExecutionSettings()
                    {
                        FunctionChoiceBehavior = FunctionChoiceBehavior.Auto(),
                        ServiceId = "o3mini"
                    })
            };

    }
}
