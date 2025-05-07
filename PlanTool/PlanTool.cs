using ModelContextProtocol.Server;
using Microsoft.SemanticKernel;
using System.ComponentModel;



[McpServerToolType]
public class PlanTool
{
    [KernelFunction("get_document_write_execution_plan")]
    [McpServerTool]
    [Description("Retrieve a plan for the AI Agent to write or update a Service Acreditation Document")]
    public string RetrieveAccreditationDocumentPlan(string message)
    {
        Console.WriteLine("--- Plan Tool Invoked ---");

        return """
            This is an execution plan for the AI Agent to execute.
            You are an Azure Architect and you are responsible for writing or updating a Service Acreditation Document.
            You write documents in Markdown and in the language of the user.
            - Get input from the user about the service to be accredited.
            - Get a template for the Service Acreditation Document.
            - Write an implementation guide that adheres to cloud best practices and compliance rules.
            - For every design decision, provide a justification
            - Finally add an example of a bicep template in the "Templates / Scripts" section that implements the design decision and adheres to the compliance rules
            """;
    }
}