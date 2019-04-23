using DarkSide;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin;
using Microsoft.Owin.Security.Cookies;
using Owin;
using System.Configuration;
using WebApplication1.Models;

namespace WebApplication1
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            app.CreatePerOwinContext<Concrete>(CreateConcrete);
            ConfigureAuth(app);
        }

        public void ConfigureAuth(IAppBuilder app)
        {
            app.CreatePerOwinContext(() => ApplicationDbContext.Create(ConnectionName));

            app.CreatePerOwinContext<UserManager>(UserManager.Create);
            app.CreatePerOwinContext<RoleManager>(RoleManager.Create);
            app.UseCookieAuthentication(new CookieAuthenticationOptions {
                AuthenticationType = DefaultAuthenticationTypes.ApplicationCookie,
                LoginPath = new PathString("/account/login") });
        }

        public string ConnectionName
        {
            get
            {
                return ConfigurationManager.AppSettings["sys:connectionName"];
            }
        }
        public Concrete CreateConcrete(IdentityFactoryOptions<Concrete> options, IOwinContext context)
        {
            return new Concrete(ConfigurationManager.ConnectionStrings[ConnectionName]);
        }
    }
}