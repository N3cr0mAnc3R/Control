﻿using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin.Security;
using Newtonsoft.Json;
using System;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web;
using System.Web.Helpers;
using System.Web.Mvc;
using System.Web.Script.Serialization;
using System.Web.Security;
using WebApp.Models;
using WebApp.Models.Managers;

namespace WebApp.Controllers
{
    [Authorize]
    public class AccountController : BaseController
    {
        private ApplicationSignInManager _signInManager;
        private ApplicationUserManager _userManager;
        private object ConfgurationManager;

        public AccountController()
        {
        }

        public AccountController(ApplicationUserManager userManager, ApplicationSignInManager signInManager)
        {
            UserManager = userManager;
            SignInManager = signInManager;
        }

        public ApplicationSignInManager SignInManager
        {
            get
            {
                return _signInManager ?? HttpContext.GetOwinContext().Get<ApplicationSignInManager>();
            }
            private set
            {
                _signInManager = value;
            }
        }

        public ApplicationUserManager UserManager
        {
            get
            {
                return _userManager ?? HttpContext.GetOwinContext().GetUserManager<ApplicationUserManager>();
            }
            private set
            {
                _userManager = value;
            }
        }

        //
        // GET: /Account/Login
        [AllowAnonymous]
        public ActionResult Login(string returnUrl)
        {
            ViewBag.ReturnUrl = returnUrl;
            return View();
        }

        //
        // POST: /Account/Login
        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> Login(LoginViewModel model, string returnUrl)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }

            // Сбои при входе не приводят к блокированию учетной записи
            // Чтобы ошибки при вводе пароля инициировали блокирование учетной записи, замените на shouldLockout: true
            var result = await SignInManager.PasswordSignInAsync(model.Email, model.Password, model.RememberMe, shouldLockout: false);
            switch (result)
            {
                case SignInStatus.Success:
                    ApplicationModel md = (ApplicationModel)TempData["application"];
                    if (md != null)
                    {
                        ApplicationUser user = UserManager.FindByEmail(model.Email);
                        await ApplicationManager.SubmitApplication(md, user.Id);
                        return RedirectToLocal("profile/userprofile");
                    }
                    return RedirectToLocal(returnUrl);
                case SignInStatus.LockedOut:
                    return View("Lockout");
                case SignInStatus.RequiresVerification:
                    return RedirectToAction("SendCode", new { ReturnUrl = returnUrl, RememberMe = model.RememberMe });
                case SignInStatus.Failure:
                default:
                    ModelState.AddModelError("", "Неудачная попытка входа.");
                    return View(model);
            }
        }

        //
        // GET: /Account/VerifyCode
        [AllowAnonymous]
        public async Task<ActionResult> VerifyCode(string provider, string returnUrl, bool rememberMe)
        {
            // Требовать предварительный вход пользователя с помощью имени пользователя и пароля или внешнего имени входа
            if (!await SignInManager.HasBeenVerifiedAsync())
            {
                return View("Error");
            }
            return View(new VerifyCodeViewModel { Provider = provider, ReturnUrl = returnUrl, RememberMe = rememberMe });
        }

        //
        // POST: /Account/VerifyCode
        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> VerifyCode(VerifyCodeViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }

            // Приведенный ниже код защищает от атак методом подбора, направленных на двухфакторные коды. 
            // Если пользователь введет неправильные коды за указанное время, его учетная запись 
            // будет заблокирована на заданный период. 
            // Параметры блокирования учетных записей можно настроить в IdentityConfig
            var result = await SignInManager.TwoFactorSignInAsync(model.Provider, model.Code, isPersistent: model.RememberMe, rememberBrowser: model.RememberBrowser);
            switch (result)
            {
                case SignInStatus.Success:
                    return RedirectToLocal(model.ReturnUrl);
                case SignInStatus.LockedOut:
                    return View("Lockout");
                case SignInStatus.Failure:
                default:
                    ModelState.AddModelError("", "Неправильный код.");
                    return View(model);
            }
        }

        //
        // GET: /Account/Register
        [AllowAnonymous]
        public ActionResult Register()
        {
            return View();
        }

        //
        // POST: /Account/Register
        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> Register(RegisterViewModel model)
        {
            if (ModelState.IsValid)
            {
                var user = new ApplicationUser { UserName = model.Email, Email = model.Email };
                var result = await UserManager.CreateAsync(user, model.Password);
                if (result.Succeeded)
                {
                    AccountManager.AddNewUser(user.Id);
                    await SignInManager.SignInAsync(user, isPersistent: false, rememberBrowser: false);

                    // Дополнительные сведения о включении подтверждения учетной записи и сброса пароля см. на странице https://go.microsoft.com/fwlink/?LinkID=320771.
                    // Отправка сообщения электронной почты с этой ссылкой
                    // string code = await UserManager.GenerateEmailConfirmationTokenAsync(user.Id);
                    // var callbackUrl = Url.Action("ConfirmEmail", "Account", new { userId = user.Id, code = code }, protocol: Request.Url.Scheme);
                    // await UserManager.SendEmailAsync(user.Id, "Подтверждение учетной записи", "Подтвердите вашу учетную запись, щелкнув <a href=\"" + callbackUrl + "\">здесь</a>");

                    return RedirectToAction("Index", "Home");
                }
                AddErrors(result);
            }

            // Появление этого сообщения означает наличие ошибки; повторное отображение формы
            return View(model);
        }

        //
        // GET: /Account/ConfirmEmail
        [AllowAnonymous]
        public async Task<ActionResult> ConfirmEmail(string userId, string code)
        {
            if (userId == null || code == null)
            {
                return View("Error");
            }
            var result = await UserManager.ConfirmEmailAsync(userId, code);
            return View(result.Succeeded ? "ConfirmEmail" : "Error");
        }

        //
        // GET: /Account/ForgotPassword
        [AllowAnonymous]
        public ActionResult ForgotPassword()
        {
            return View();
        }

        //
        // POST: /Account/ForgotPassword
        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> ForgotPassword(ForgotPasswordViewModel model)
        {
            if (ModelState.IsValid)
            {
                var user = await UserManager.FindByNameAsync(model.Email);
                if (user == null || !(await UserManager.IsEmailConfirmedAsync(user.Id)))
                {
                    // Не показывать, что пользователь не существует или не подтвержден
                    return View("ForgotPasswordConfirmation");
                }

                // Дополнительные сведения о включении подтверждения учетной записи и сброса пароля см. на странице https://go.microsoft.com/fwlink/?LinkID=320771.
                // Отправка сообщения электронной почты с этой ссылкой
                // string code = await UserManager.GeneratePasswordResetTokenAsync(user.Id);
                // var callbackUrl = Url.Action("ResetPassword", "Account", new { userId = user.Id, code = code }, protocol: Request.Url.Scheme);		
                // await UserManager.SendEmailAsync(user.Id, "Сброс пароля", "Сбросьте ваш пароль, щелкнув <a href=\"" + callbackUrl + "\">здесь</a>");
                // return RedirectToAction("ForgotPasswordConfirmation", "Account");
            }

            // Появление этого сообщения означает наличие ошибки; повторное отображение формы
            return View(model);
        }

        //
        // GET: /Account/ForgotPasswordConfirmation
        [AllowAnonymous]
        public ActionResult ForgotPasswordConfirmation()
        {
            return View();
        }

        //
        // GET: /Account/ResetPassword
        [AllowAnonymous]
        public ActionResult ResetPassword(string code)
        {
            return code == null ? View("Error") : View();
        }

        //
        // POST: /Account/ResetPassword
        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> ResetPassword(ResetPasswordViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }
            var user = await UserManager.FindByNameAsync(model.Email);
            if (user == null)
            {
                // Не показывать, что пользователь не существует
                return RedirectToAction("ResetPasswordConfirmation", "Account");
            }
            var result = await UserManager.ResetPasswordAsync(user.Id, model.Code, model.Password);
            if (result.Succeeded)
            {
                return RedirectToAction("ResetPasswordConfirmation", "Account");
            }
            AddErrors(result);
            return View();
        }

        //
        // GET: /Account/ResetPasswordConfirmation
        [AllowAnonymous]
        public ActionResult ResetPasswordConfirmation()
        {
            return View();
        }

        //
        // POST: /Account/ExternalLogin
        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public ActionResult ExternalLogin(string provider, string returnUrl)
        {
            // Запрос перенаправления к внешнему поставщику входа
            return new ChallengeResult(provider, Url.Action("ExternalLoginCallback", "Account", new { ReturnUrl = returnUrl }));
        }

        //
        // GET: /Account/SendCode
        [AllowAnonymous]
        public async Task<ActionResult> SendCode(string returnUrl, bool rememberMe)
        {
            var userId = await SignInManager.GetVerifiedUserIdAsync();
            if (userId == null)
            {
                return View("Error");
            }
            var userFactors = await UserManager.GetValidTwoFactorProvidersAsync(userId);
            var factorOptions = userFactors.Select(purpose => new SelectListItem { Text = purpose, Value = purpose }).ToList();
            return View(new SendCodeViewModel { Providers = factorOptions, ReturnUrl = returnUrl, RememberMe = rememberMe });
        }

        //
        // POST: /Account/SendCode
        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> SendCode(SendCodeViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return View();
            }

            // Создание и отправка маркера
            if (!await SignInManager.SendTwoFactorCodeAsync(model.SelectedProvider))
            {
                return View("Error");
            }
            return RedirectToAction("VerifyCode", new { Provider = model.SelectedProvider, ReturnUrl = model.ReturnUrl, RememberMe = model.RememberMe });
        }

        //
        // GET: /Account/ExternalLoginCallback
        [AllowAnonymous]
        public async Task<ActionResult> ExternalLoginCallback(string returnUrl)
        {
            var loginInfo = await AuthenticationManager.GetExternalLoginInfoAsync();
            if (loginInfo == null)
            {
                return RedirectToAction("Login");
            }

            // Выполнение входа пользователя посредством данного внешнего поставщика входа, если у пользователя уже есть имя входа
            var result = await SignInManager.ExternalSignInAsync(loginInfo, isPersistent: false);
            switch (result)
            {
                case SignInStatus.Success:
                    return RedirectToLocal(returnUrl);
                case SignInStatus.LockedOut:
                    return View("Lockout");
                case SignInStatus.RequiresVerification:
                    return RedirectToAction("SendCode", new { ReturnUrl = returnUrl, RememberMe = false });
                case SignInStatus.Failure:
                default:
                    ApplicationUser user = UserManager.FindByEmail(loginInfo.Email);
                    if (user != null)
                    {
                        ClaimsIdentity ident = UserManager.CreateIdentity(user, DefaultAuthenticationTypes.ApplicationCookie);
                        AuthenticationManager.SignOut();
                        AuthenticationManager.SignIn(new AuthenticationProperties() { IsPersistent = false }, ident);
                        return Redirect("/");
                    }
                    // Если у пользователя нет учетной записи, то ему предлагается создать ее
                    ViewBag.ReturnUrl = returnUrl;
                    ViewBag.LoginProvider = loginInfo.Login.LoginProvider;
                    return View("ExternalLoginConfirmation", new ExternalLoginConfirmationViewModel { Email = loginInfo.Email });
            }
        }

        //
        // POST: /Account/ExternalLoginConfirmation
        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> ExternalLoginConfirmation(ExternalLoginConfirmationViewModel model, string returnUrl)
        {
            if (User.Identity.IsAuthenticated)
            {
                return RedirectToAction("Index", "Manage");
            }

            if (ModelState.IsValid)
            {
                // Получение сведений о пользователе от внешнего поставщика входа
                var info = await AuthenticationManager.GetExternalLoginInfoAsync();
                if (info == null)
                {
                    return View("ExternalLoginFailure");
                }
                var user = new ApplicationUser {
                    UserName = model.Email,
                    Email = model.Email
                    //Name = model.Name,
                    //Birthdate = model.Birthdate
                };
                var result = await UserManager.CreateAsync(user);
                if (result.Succeeded)
                {
                    result = await UserManager.AddLoginAsync(user.Id, info.Login);
                    if (result.Succeeded)
                    {
                        await SignInManager.SignInAsync(user, isPersistent: false, rememberBrowser: false);
                        return RedirectToLocal(returnUrl);
                    }
                }
                AddErrors(result);
            }

            ViewBag.ReturnUrl = returnUrl;
            return View(model);
        }

        //
        // POST: /Account/LogOff
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult LogOff()
        {
            AuthenticationManager.SignOut(DefaultAuthenticationTypes.ApplicationCookie);
            return RedirectToAction("Index", "Home");
        }

        //
        // GET: /Account/ExternalLoginFailure
        [AllowAnonymous]
        public ActionResult ExternalLoginFailure()
        {
            return View();
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                if (_userManager != null)
                {
                    _userManager.Dispose();
                    _userManager = null;
                }

                if (_signInManager != null)
                {
                    _signInManager.Dispose();
                    _signInManager = null;
                }
            }

            base.Dispose(disposing);
        }

        //СВОЁ
        [AllowAnonymous]
        [HttpPost]
        public async Task<JsonResult> GetVkInfo()
        {
            string[] scope = new string[] { "email" };
            string url = string.Format("https://oauth.vk.com/authorize?client_id={0}&redirect_uri={1}&display={2}&scope={3}&response_type=token&v={4}",
                ConfigurationManager.AppSettings["vk:clientId"],
                ConfigurationManager.AppSettings["vk:redirect_uri"],
                ConfigurationManager.AppSettings["vk:display"], String.Join(",", scope),
                ConfigurationManager.AppSettings["vk:version"]);
            return Json(url);
        }

        [AllowAnonymous]
        [HttpPost]
        public async Task<JsonResult> GetOkInfo()
        {
            string[] scope = new string[] { "VALUABLE_ACCESS", "get_email" };
            string url = string.Format("https://connect.ok.ru/oauth/authorize?client_id={0}&scope={1}&response_type=code&redirect_uri={2}",
                ConfigurationManager.AppSettings["ok:clientId"],
                String.Join(";", scope),
                ConfigurationManager.AppSettings["ok:redirect_uri"]);
            return Json(url);
        }
        [AllowAnonymous]
        public ActionResult RedirectOk(string code, string access_token)
        {
            return View();
        }
        [AllowAnonymous]
        [HttpPost]
        public JsonResult GetOKTokenUrl(string code)
        {
            string url = string.Format("https://api.ok.ru/oauth/token.do?code={0}&client_id={1}&client_secret={2}&redirect_uri={3}&grant_type=authorization_code",
                code,
                ConfigurationManager.AppSettings["ok:clientId"],
                ConfigurationManager.AppSettings["ok:clientSecret"],
                 ConfigurationManager.AppSettings["ok:redirect_uri"]);
            return Json(url);
        }
        [AllowAnonymous]
        [HttpPost]
        public JsonResult GetOKUserInfo(string access_token)
        {
            using (MD5 md5Hash = MD5.Create())
            {
                byte[] data = md5Hash.ComputeHash(Encoding.UTF8.GetBytes(access_token + ConfigurationManager.AppSettings["ok:clientSecret"]));
                StringBuilder sBuilder = new StringBuilder();
                for (int i = 0; i < data.Length; i++)
                {
                    sBuilder.Append(data[i].ToString("x2"));
                }
                string another = String.Format("application_key={0}format=Jsonmethod=users.getCurrentUser{1}", ConfigurationManager.AppSettings["ok:clientOpen"], sBuilder.ToString());
                data = md5Hash.ComputeHash(Encoding.UTF8.GetBytes(another));
                sBuilder = new StringBuilder();
                for (int i = 0; i < data.Length; i++)
                {
                    sBuilder.Append(data[i].ToString("x2"));
                }
                string url = string.Format("https://api.ok.ru/fb.do?application_key={0}&format=Json&method=users.getCurrentUser&sig={1}&access_token={2}",
                    ConfigurationManager.AppSettings["ok:clientOpen"],
                    sBuilder.ToString(),
                     access_token);
                return Json(url);
            }
        }
        public void OKUserInfoUpdate(string bday, string name)
        {
            bool needUpdate = false;
            UserInfoModel currentInfo = ProfileManager.GetUserInfo(CurrentUser.Id);
            DateTime birthday = DateTime.Parse(bday);
            if ((currentInfo.DateOfBirth == null || currentInfo.DateOfBirth == new DateTime(0))
                        && (birthday != null || birthday != new DateTime(0)))
            {
                needUpdate = true;
                currentInfo.DateOfBirth = birthday;
            }
            if ((currentInfo.FullName == "" || currentInfo.FullName == null)
                && (name != ""))
            {
                needUpdate = true;
                currentInfo.FullName = name;
            }
            // ... то обновляем внутреннюю учетку 
            if (needUpdate)
                ProfileManager.ChangeUserInfo(CurrentUser.Id, currentInfo);


        }

        [AllowAnonymous]
        [HttpGet]
        public ActionResult AuthVk(string access_token, int? expires_in, int? user_id, string email)
        {
            if (user_id != null)
            {
                // Создаем юрл запроса на получение информации о пользователе вк
                string uriString = String.Format("https://api.vk.com/method/users.get?user_ids={0}&fields=bdate&access_token={1}&v={2}", 
                    user_id,
                    access_token,
                    ConfigurationManager.AppSettings["vk:version"]);
                HttpWebRequest req = (HttpWebRequest)HttpWebRequest.Create(uriString);

                // Получаем ответ от ВК, распаковываем JSON в модель
                VkUserInfoResponse userInfo = null;
                using (HttpWebResponse resp = (HttpWebResponse)req.GetResponse())
                {
                    using (var reader = new StreamReader(resp.GetResponseStream()))
                    {
                        JavaScriptSerializer js = new JavaScriptSerializer();
                        var objText = reader.ReadToEnd();
                        userInfo = (VkUserInfoResponse)js.Deserialize(objText, typeof(VkUserInfoResponse));
                    }

                }

                // Если ВК по телефону, а не по емэйлу, то переходим в авторизацию как в одноклассниках, а далее запрашиваем почту  
                if (email == "" || email == null)
                {
                    AuthThirdParty(access_token, expires_in, user_id.ToString(), email, "vkontakte");
                    return Redirect("/Profile/RequestEmail");
                }
                else // находим или создаем внутреннюю учетку пользователя
                {
                    ApplicationUser user = UserManager.FindByEmail(email);
                    if (user == null)
                    {
                        user = new ApplicationUser()
                        {
                            Email = email,
                            UserName = email
                        };

                        IdentityResult result = UserManager.Create(user);
                        if (!result.Succeeded)
                        {
                            return Redirect("/account/login");
                        }
                        AccountManager.AddNewUser(user.Id);
                    }

                    // Логиним пользователя
                    ClaimsIdentity ident = UserManager.CreateIdentity(user, DefaultAuthenticationTypes.ApplicationCookie);
                    AuthenticationManager.SignOut();
                    AuthenticationManager.SignIn(new AuthenticationProperties() { IsPersistent = false }, ident);

                    // Получаем информацио о пользователе ВК
                    UserInfoModel currentInfo = ProfileManager.GetUserInfo(user.Id);
                    bool needUpdate = false;
                   
                    // Если дата рождения или имя во внутренней учетке нет, а в ВК есть, то...
                    if ((currentInfo.DateOfBirth == null || currentInfo.DateOfBirth == new DateTime(0))
                        && (userInfo.response[0].bDate1 != null || userInfo.response[0].bDate1 != new DateTime(0)))
                    {
                        needUpdate = true;
                        currentInfo.DateOfBirth = userInfo.response[0].bDate1;
                    }
                    if ((currentInfo.FullName == "" || currentInfo.FullName == null)
                        && (userInfo.response[0].first_name != ""))
                    {
                        needUpdate = true;
                        currentInfo.FullName = userInfo.response[0].first_name + " " + userInfo.response[0].last_name;
                    }
                    // ... то обновляем внутреннюю учетку 
                    if (needUpdate)
                        ProfileManager.ChangeUserInfo(user.Id, currentInfo);

                    return Redirect("/application/getapplication");
                }
            }
            return View();
        }

        [AllowAnonymous]
        [HttpGet]
        public ActionResult AuthThirdParty(string access_token, int? expires_in, string user_id,
                                           string email, string provider, string bday = "", string name = "")
        {

            if (user_id != "")
            {
                // Пред тем, как лезть в таблицу ThirdPartyAuth, проверь email
                ApplicationUser user = null;
                if (email != null)
                {
                    user = UserManager.FindByEmail(email);
                }

                if(user == null)
                {

                    user = UserManager.FindById(AccountManager.GetUserIdFromThirdPartyAuth(user_id, provider));
                    if (user == null)
                    {
                        if (!String.IsNullOrWhiteSpace(email))
                        {
                            user = new ApplicationUser()
                            {
                                Email = email,
                                UserName = email,

                            };
                        }
                        else
                        {

                            user = new ApplicationUser()
                            {
                                UserName = Regex.Replace(Membership.GeneratePassword(8, 0), @"[^a-zA-Z0-9]", m => "9")
                            };
                        }

                        IdentityResult result = UserManager.Create(user);

                        if (!result.Succeeded)
                        {
                            return Redirect("/account/login");
                        }
                        AccountManager.AddNewUser(user.Id);
                        AccountManager.AddThirdPartyAuth(user.Id, user_id, provider);
                    }
                }
                OKUserInfoUpdate(bday, name);
                // авторизует 3 строчки
                ClaimsIdentity ident = UserManager.CreateIdentity(user, DefaultAuthenticationTypes.ApplicationCookie);
                AuthenticationManager.SignOut();
                AuthenticationManager.SignIn(new AuthenticationProperties() { IsPersistent = false }, ident);
                if (user.Email != "")
                {
                    return Redirect("/application/getapplication");
                }
                else
                {
                    return Redirect("profile/requestemail");
                }
            }
            return View();
        }


        #region Вспомогательные приложения
        // Используется для защиты от XSRF-атак при добавлении внешних имен входа
        private const string XsrfKey = "XsrfId";

        private IAuthenticationManager AuthenticationManager
        {
            get
            {
                return HttpContext.GetOwinContext().Authentication;
            }
        }

        private void AddErrors(IdentityResult result)
        {
            foreach (var error in result.Errors)
            {
                ModelState.AddModelError("", error);
            }
        }

        private ActionResult RedirectToLocal(string returnUrl)
        {
            if (Url.IsLocalUrl(returnUrl))
            {
                return Redirect(returnUrl);
            }
            return RedirectToAction("Index", "Home");
        }

        internal class ChallengeResult : HttpUnauthorizedResult
        {
            public ChallengeResult(string provider, string redirectUri)
                : this(provider, redirectUri, null)
            {
            }

            public ChallengeResult(string provider, string redirectUri, string userId)
            {
                LoginProvider = provider;
                RedirectUri = redirectUri;
                UserId = userId;
            }

            public string LoginProvider { get; set; }
            public string RedirectUri { get; set; }
            public string UserId { get; set; }

            public override void ExecuteResult(ControllerContext context)
            {
                var properties = new AuthenticationProperties { RedirectUri = RedirectUri };
                if (UserId != null)
                {
                    properties.Dictionary[XsrfKey] = UserId;
                }
                context.HttpContext.GetOwinContext().Authentication.Challenge(properties, LoginProvider);
            }
        }
        #endregion


        protected ApplicationManager ApplicationManager
        {
            get
            {
                return Request.GetOwinContext().Get<ApplicationManager>();
            }
        }
        protected AccountManager AccountManager
        {
            get
            {
                return Request.GetOwinContext().Get<AccountManager>();
            }
        }
        protected ProfileManager ProfileManager
        {
            get
            {
                return Request.GetOwinContext().Get<ProfileManager>();
            }
        }
    }
}