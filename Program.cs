using Blazorise;
using Blazorise.Bootstrap5;
using BlazoriseDateInputRepro.Components;

var builder = WebApplication.CreateBuilder( args );

builder.Services
    .AddBlazorise()
    .AddBootstrap5Providers();

builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

var app = builder.Build();

if ( !app.Environment.IsDevelopment() )
{
    app.UseExceptionHandler( "/Error", createScopeForErrors: true );
}

app.UseAntiforgery();

app.MapStaticAssets();
app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode();

app.Run();
