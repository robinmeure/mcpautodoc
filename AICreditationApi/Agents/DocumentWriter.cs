using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.Agents;
using Microsoft.SemanticKernel.Connectors.OpenAI;

namespace AICreditationApi.Agents;

public class DocumentWriter
{
    public ChatCompletionAgent CreateAgent(Kernel kernel, string Topic, string agentName)
    {
        // Clone kernel instance to allow for agent specific plug-in definition
        Kernel agentKernel = kernel.Clone();

        // Import plug-in from type
        agentKernel.ImportPluginFromType<TemplateTool>();

       
        // Create the agent
        return
            new ChatCompletionAgent()
            {
                Name = agentName,
                Instructions = $"""
                    Your responsibility is to write a service accreditation document based on a given topic: {Topic}.
                    RULES:
                    - Use the given context of the topic, all the relevant data, which compliancy rules apply.
                    - Use the given template (using the template tool) to fill out the sections and maintain the structure.
                    - Use all the compliance rules which are given by another agent and see where these make sense to be used.

                    The current date = {DateOnly.FromDateTime}
                    Please keep the changelog up to date and versioned during iterations
                    Keep using the template for your document structure
                    You write Markdown in Dutch
                """,
                Kernel = agentKernel,
                Arguments = new KernelArguments(
                    new OpenAIPromptExecutionSettings()
                    {
                        FunctionChoiceBehavior = FunctionChoiceBehavior.Auto()
                    })
            };
    }

    public static string Instruction = """
        You are a technical writer and you are tasked
        with writing a Service Acreditation Document for {Topic}".
        
        The goal is to refine and decide on the single best copy as an expert in the field.
        Only provide a single proposal per response.
        You're laser focused on the goal at hand.
        Don't waste time with chit chat.
        Consider suggestions when refining an idea.
        Keep using the template for your document structure
        You write Markdown
    """;

    
}
