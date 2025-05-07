using Microsoft.SemanticKernel;
using ModelContextProtocol.Server;
using System.ComponentModel;

[McpServerToolType]
public class TemplateTool
{
    [KernelFunction("get_document_template")]
    [McpServerTool]
    [Description("Retrieves a template for a Service Acreditation Document")]

    public string Template(string message, string serviceName)
    {
        Console.WriteLine("--- Template Tool Invoked ---");

        return $"""
        # {serviceName} Accreditatie Document
        ## 1. Versions history");
        - [Placeholder Versions history] (get_current_date)
        ## 2. Cloud service
        - [Placeholder Cloud service]
        ## Details"
        - [Placeholder Details]
        ## Generic Trusted Cloud policies
        - [Placeholder Trusted Cloud]
        ## Certifications"
        - [Placeholder Certifications]
        ## Service levels
        - [Placeholder Service levels]
        ## Deployment
        - [Placeholder deployment]
        ## Optional controls
        - [Placeholder Optional controls]
        ## Optional Templates / scripts
        - [Placeholder Templates / scripts]
        """;
    }

    [KernelFunction("get_current_date")]
    [Description("Retrieves the current date")]
    public string CurrentDate()
    {
        Console.WriteLine("--- Date Tool Invoked ---");
        return DateOnly.FromDateTime(DateTime.Now).ToString();

    }
}

