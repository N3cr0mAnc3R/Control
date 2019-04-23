using Microsoft.AspNet.Identity;
using Microsoft.Owin.Security;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using WebApplication1.Controllers.Abstract;
using WebApplication1.Models;
using WebApplication1.Models.AccountModels;

namespace WebApplication1.Controllers.Api
{
    [RoutePrefix("api/account")]
    public class AccountController : BaseApiController
    {
        [AllowAnonymous]
        [HttpPost]
        [Route("registration")]
        public async Task<IHttpActionResult> Registration(RegisterModel model)
        {
            User user = new User() { UserName = model.Login, Email = model.Email };
            IdentityResult result = await UserManager.CreateAsync(user, model.Password);
            if (result.Succeeded)
            {
                await SignInAsync(user, false);
            }
            else return WrapError(String.Join(". ", result.Errors));
            user = UserManager.FindByName(user.UserName);
            return WrapSuccess(await CreateUserProfile(user));

        }

        public async Task SignInAsync(User user, bool v)
        {
            AuthManager.SignOut(DefaultAuthenticationTypes.ApplicationCookie);
            ClaimsIdentity identity = await UserManager.CreateIdentityAsync(user, DefaultAuthenticationTypes.ApplicationCookie);

            AuthManager.SignIn(new AuthenticationProperties() { IsPersistent = v },  identity );
        }

        private async Task<UserProfile> CreateUserProfile(User user)
        {
            if (user != null)
            {
                return new UserProfile(user);
            }
            return null;
        }
        [HttpPost]
        [Route("logout")]
        public IHttpActionResult Logout()
        {
            AuthManager.SignOut();
            return WrapSuccess();
        }
        [AllowAnonymous]
        [HttpPost]
        [Route("login")]
        public async Task<IHttpActionResult> login(LoginModel model)
        {
            if (!ModelState.IsValid)
            {
                return WrapError("Логин и/или пароль не введены");
            }
            if (model.Login.Contains("@"))
            {
                User emailUser = await UserManager.FindByEmailAsync(model.Login);
                if (emailUser != null)
                {
                    model.Login = emailUser.UserName;
                }
            }
            User user = await UserManager.FindAsync(model.Login, model.Password);
            if (user == null)
            {
                return WrapError("Логин/пароль введены неверно");
            }
            await SignInAsync(user, model.RememberMe);
            return WrapSuccess(await CreateUserProfile(user));
        }
    }
}