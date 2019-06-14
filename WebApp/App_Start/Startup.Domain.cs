using DarkSide;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin;
using Owin;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using WebApp.Models.Managers;

namespace WebApp
{
    public partial class Startup
    {
        public void DomainConfiguration(IAppBuilder app)
        {

            app.CreatePerOwinContext((IdentityFactoryOptions<NewsManager> options, IOwinContext context) =>
            {
                return new NewsManager(context.Get<Concrete>());
            });
            app.CreatePerOwinContext((IdentityFactoryOptions<ApplicationManager> options, IOwinContext context) =>
            {
                return new ApplicationManager(context.Get<Concrete>());
            });
            app.CreatePerOwinContext((IdentityFactoryOptions<ProfileManager> options, IOwinContext context) =>
            {
                return new ProfileManager(context.Get<Concrete>());
            });
            app.CreatePerOwinContext((IdentityFactoryOptions<MainManager> options, IOwinContext context) =>
            {
                return new MainManager(context.Get<Concrete>());
            });





        }
        /// <summary>
        /// Имя строки соединения с БД
        /// </summary>
        public string ConnectionName
        {
            get
            {
                return ConfigurationManager.AppSettings["sys:connectionName"];
            }
        }

        /// <summary>
        /// Метод возвращает строку соединения по умолчанию
        /// </summary>
        /// <returns>Объект строки соединения</returns>
        public ConnectionStringSettings GetConnectionStringSettings()
        {
            return ConfigurationManager.ConnectionStrings[ConnectionName];
        }

        /// <summary>
        /// Создает объект управления подключением к БД
        /// </summary>
        public Concrete CreateConcrete(IdentityFactoryOptions<Concrete> options, IOwinContext context)
        {
            return new Concrete(GetConnectionStringSettings());
        }
    }
}