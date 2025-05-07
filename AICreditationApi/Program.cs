using AICreditationApi.Helpers;
using Azure.Identity;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.TextGeneration;
using ModelContextProtocol.AspNetCore;
using System.Reflection;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container
// This is where we add the MCP server with it's dependencies for our tools to be used
builder.Services.AddMcpServer()
    .WithToolsFromAssembly(Assembly.GetAssembly(typeof(PlanTool)))
    .WithToolsFromAssembly(Assembly.GetAssembly(typeof(LearnTool)))
    .WithToolsFromAssembly(Assembly.GetAssembly(typeof(TemplateTool)));

builder.Services.AddSingleton<IConfiguration>(builder.Configuration);

// the below configuration is used to use the Azure OpenAI service
builder.Services.AddSingleton<LearnTool>();

var reasoningModel = builder.Configuration["AzureOpenAI:ReasoningModel"];
var completionModel = builder.Configuration["AzureOpenAI:CompletionModel"];
var endpoint = builder.Configuration["AzureOpenAI:Endpoint"];
var tenantId = builder.Configuration["EntraId:TenantId"];

// setting the managed identity for the app (locally this reverts back to the VS/VSCode/AZCli credentials)
DefaultAzureCredentialOptions azureCredentialOptions = DefaultCredentialOptions.GetDefaultAzureCredentialOptions(
    environmentName: builder.Environment.EnvironmentName,
    tenantId: tenantId,
    clientId: null);

var azureCredential = new DefaultAzureCredential(azureCredentialOptions);


builder.Services.AddKernel().AddAzureOpenAIChatCompletion(
        deploymentName: reasoningModel!,
        endpoint: endpoint!,
        azureCredential,
        serviceId: "o3mini" // this is the service id for the agents for reasoning we use o3
    );

builder.Services.AddKernel().AddAzureOpenAIChatCompletion(
        deploymentName: completionModel!,
        endpoint: endpoint!,
        azureCredential,
        serviceId: "gpt4o" // this is the service id for the formatting of the document, using gpt4o
    );




builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
//builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
//if (app.Environment.IsDevelopment())
//{
//    app.MapOpenApi();
//}

//CANNOT use HttpsRedirection with MCP locally since the cert is not trusted
//app.UseHttpsRedirection();
// CORS.
app.UseCors(builder => builder
    .AllowAnyHeader()
    .AllowAnyMethod()
    .SetIsOriginAllowed((host) => true)
    .AllowCredentials()
);

app.UseAuthorization();
app.MapMcp();
app.MapControllers();

app.Run();
