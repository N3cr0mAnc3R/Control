
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using WebApp.Models;
using WebApp.Models.Common;
using WebApp.Models.Managers;

namespace WebApp.Controllers
{
    [Authorize]
    public class ProfileController : BaseController
    {
        // GET: Profile
        public ActionResult UserProfile()
        {
            return View();
        }
        [Authorize(Roles ="Администратор")]
        public ActionResult ModeratorProfile()
        {
            //проверить доступ
            return View();
        }
        [Authorize(Roles ="Администратор")]
        public ActionResult ChangeNew(int? Id)
        {
            //проверить доступ
            return View();
        }
        public JsonResult GetNewById(int Id)
        {
            return Json(NewsManager.GetNewById(Id));
        }

        [Authorize(Roles = "Чиновник")]
        public ActionResult OfficialProfile()
        {
            //проверить доступ
            return View();
        }
        [Authorize(Roles = "Администратор")]
        public ActionResult Edit(int Id)
        {
            if (CheckAccess(Id))
            {
                return View();
            }
            return Redirect("/");
        }
        public ActionResult EditProfileInfo()
        {
            //проверить, есть ли  доступ у пользователя к профилю
            return View();

            //return Redirect("/");
        }
        [AllowAnonymous]
        public ActionResult RequestEmail()
        {
            return View();
        }
        public bool CheckAccess(int Id)
        {
            return ProfileManager.CheckAccess(Id, CurrentUser.Id);
        }
        [HttpPost]
        [AllowAnonymous]
        public JsonResult SelectApplications()
        {
            return Json(ProfileManager.SelectApplications());
        }

        [HttpPost]
        [Authorize(Roles = "Администратор")]
        public JsonResult SelectApplicationsForAdmin()
        {
            return Json(ProfileManager.SelectAllApplications());
        }

        [HttpPost]
        public JsonResult SelectApplicationsByUserId()
        {
            return Json(ProfileManager.SelectApplicationsByUserId(CurrentUser.Id));
        }
        [HttpPost]
        [AllowAnonymous]
        public JsonResult SelectApplicationById(int Id)
        {
            return Json(ProfileManager.SelectApplicationById(Id));
        }
        [HttpPost]
        [Authorize(Roles = "Администратор, Чиновник")]
        public JsonResult SelectApplicationsByStatusId(int StatusId)
        {
            return Json(ProfileManager.SelectApplicationsByStatusId(StatusId));
        }

        [HttpPost]
        public void DeleteApplication(int ApplicationId)
        {
            //!проверить доступ
            if (CheckAccess(ApplicationId))
            {
                ProfileManager.DeleteApplication(ApplicationId);
            }
        }
        [HttpPost]
        public void ChangeApplicationText(int ApplicationId, string Text)
        {
            //!проверить доступ
            if (CheckAccess(ApplicationId))
            {
                ProfileManager.ChangeApplicationText(ApplicationId, Text);
            }
        }
        [HttpPost]
        public void ChangeUserInfo(UserInfoModel userinfo)
        {
            //!проверить доступ


            ProfileManager.ChangeUserInfo(CurrentUser.Id, userinfo);

        }
        [AllowAnonymous]
        [HttpPost]
        public JsonResult SelectCommentsByApplicationId(int ApplicationId, int Offset = 1)
        {
            return Json(ProfileManager.SelectCommentsByApplicationId(ApplicationId, Offset));
        }
        [HttpPost]
        public void AddComment(int ApplicationId, string Text, int? ParentCommentId)
        {
            ProfileManager.AddComment(CurrentUser.Id, ApplicationId, Text, ParentCommentId);
        }
        [HttpPost]
        public JsonResult FileUpload()
        {
            if (ModelState.IsValid)
            {
                UploadFile File = new UploadFile() { File = Request.Files.Get(0) };
                ApplicationUser user = ApplicationUserManager.FindByName(User.Identity.Name);
                return Json(ProfileManager.FileUpload(File.File.InputStream, File.File.ContentType, Path.GetExtension(File.File.FileName), user.Id, File.File.FileName));
            }
            throw new ArgumentException();
        }
        [AllowAnonymous]
        public JsonResult GetUserImage(string UserId)
        {

            return Json(ProfileManager.GetUserFileStream(UserId == null ? CurrentUser.Id : UserId));

        }
        [HttpPost]
        public JsonResult GetUserInfo()
        {
            return Json(ProfileManager.GetUserInfo(CurrentUser.Id));

        }
        #region модератор
        [HttpPost]
        [Authorize(Roles = "Администратор")]
        public void AcceptApplication(int ApplicationId)
        {
            //!проверить доступ
            ProfileManager.AcceptApplication(ApplicationId);

        }
        [HttpPost]
        [Authorize(Roles = "Администратор")]
        public void DeclineApplication(int ApplicationId)
        {
            //!проверить доступ
            ProfileManager.DeclineApplication(ApplicationId);

        }
        [HttpPost, ValidateInput(false)]
        [Authorize(Roles = "Администратор")]
        public void AddNews(string Text, DateTime dateTime)
        {
            //!проверить доступ
            ProfileManager.AddNews(CurrentUser.Id, Text, dateTime);

        }
        [HttpPost]
        [Authorize(Roles = "Администратор")]
        public JsonResult GetApplicationStatuses()
        {
            return Json(ProfileManager.GetApplicationStatuses());

        }
        #endregion
        protected ProfileManager ProfileManager
        {
            get
            {
                return Request.GetOwinContext().Get<ProfileManager>();
            }
        }
        protected ApplicationUserManager ApplicationUserManager
        {
            get
            {
                return Request.GetOwinContext().Get<ApplicationUserManager>();
            }
        }
        protected NewsManager NewsManager
        {
            get
            {
                return Request.GetOwinContext().Get<NewsManager>();
            }
        }
    }
}