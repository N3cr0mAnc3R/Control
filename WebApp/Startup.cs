using DarkSide;
using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(WebApp.Startup))]
namespace WebApp
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            app.CreatePerOwinContext<Concrete>(CreateConcrete);
            ConfigureAuth(app);
            DomainConfiguration(app);
        }
    }
}
