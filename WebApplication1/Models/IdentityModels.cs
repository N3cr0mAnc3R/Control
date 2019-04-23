using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.Entity;
using System.Linq;
using System.Web;

namespace WebApplication1.Models
{
    public class UserLogin: IdentityUserLogin<int>
    {
        public UserLogin(): base() { }
    }
    public class UserRole: IdentityUserRole<int>
    {
        public UserRole(): base() { }
    }
    public class UserClaim : IdentityUserClaim<int>
    {
        public UserClaim(): base() { }
    }
    public class User: IdentityUser<int, UserLogin, UserRole, UserClaim>
    {
        public User(): base() { }
    }
    public class Role : IdentityRole<int, UserRole>
    {
        public Role(): base() { }
    }
    public class IdentityDbInit : CreateDatabaseIfNotExists<ApplicationDbContext> { }
    //public class IdentityDbInit : NullDatabaseInitializer<ApplicationDbContext> { }
    public class ApplicationDbContext: IdentityDbContext<User, Role, int, UserLogin, UserRole, UserClaim>
    {
        static ApplicationDbContext()
        {
            Database.SetInitializer(new IdentityDbInit());
        }
        public static ApplicationDbContext Create(string connStringName)
        {
            return new ApplicationDbContext(connStringName);
        }
        public ApplicationDbContext() : base(ConfigurationManager.AppSettings["sys:connectionName"]) { }
        public ApplicationDbContext (string connStringName): base (connStringName)
        {

        }
    }
    public class UserStore : UserStore<User, Role, int, UserLogin, UserRole, UserClaim>
    {
        public UserStore(DbContext context) : base(context) { }
    }

    public class RoleStore : RoleStore<Role, int, UserRole>
    {
        public RoleStore(DbContext context) : base(context) { }
    }
    public class UserManager: UserManager<User, int>
    {
        public UserManager(IUserStore<User, int> store): base (store) { }

        public static UserManager Create(IdentityFactoryOptions<UserManager> options, IOwinContext context)
        {
            ApplicationDbContext db = context.Get<ApplicationDbContext>();
            UserManager um = new UserManager(new UserStore(db));
            um.UserValidator = new UserValidator<User, int>(um) { AllowOnlyAlphanumericUserNames = false, RequireUniqueEmail = true};
            return um;
        }
    }
    public class  RoleManager: RoleManager<Role, int>
    {
        public RoleManager(RoleStore store): base(store) { }

        public static RoleManager Create(IdentityFactoryOptions<RoleManager> options, IOwinContext context)
        {
            return new RoleManager(new RoleStore(context.Get<ApplicationDbContext>()));
        }
    }
}