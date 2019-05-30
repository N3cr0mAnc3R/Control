
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
    public class ProfileController : BaseController
    {
        // GET: Profile
        public ActionResult UserProfile()
        {
            return View();
        }
        public ActionResult ModeratorProfile()
        { 
            //проверить доступ
            return View();
        }
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
        public ActionResult RequestEmail()
        {
            return View();
        }
        public bool CheckAccess(int Id)
        {
            return ProfileManager.CheckAccess(Id, CurrentUser.Id);
        }
        [HttpPost]
        public JsonResult SelectApplications()
        {
            return Json(ProfileManager.SelectApplications());
        }

        [HttpPost]
        public JsonResult SelectApplicationsByUserId()
        {
            return Json(ProfileManager.SelectApplicationsByUserId(CurrentUser.Id));
        }

        [HttpPost]
        public JsonResult SelectApplicationsByStatusId(int StatusId)
        {
            return Json(ProfileManager.SelectApplicationsByStatusId(StatusId));
        }

        [HttpPost]
        public void DeleteApplication(int ApplicationId)
        {
            //!проверить доступ
            if(CheckAccess(ApplicationId))
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
        public void ChangeUserInfo( UserInfoModel userinfo)
        {
            //!проверить доступ
            
      
                ProfileManager.ChangeUserInfo(CurrentUser.Id,userinfo);
           
        }
        [HttpPost]
        public JsonResult SelectCommentsByApplicationId (int ApplicationId, int Offset=1)
        {
            return Json(ProfileManager.SelectCommentsByApplicationId(ApplicationId, Offset));
        }
        [HttpPost]
        public void AddComment( int ApplicationId, string Text, int? ParentCommentId)
        {
            ProfileManager.AddComment(CurrentUser.Id, ApplicationId, Text, ParentCommentId);
            SelectCommentsByApplicationId( ApplicationId);
        }
        [HttpPost]
        public JsonResult FileUpload()
        {
            if (ModelState.IsValid)
            {
                UploadFile File = new UploadFile() { File = Request.Files.Get(0)} ; 
                ApplicationUser user = ApplicationUserManager.FindByName(User.Identity.Name);
                return Json(ProfileManager.FileUpload(File.File.InputStream, File.File.ContentType, Path.GetExtension(File.File.FileName), user.Id, File.File.FileName));
            }
            throw new ArgumentException();
        }
        [AllowAnonymous]
        public JsonResult GetUserImage(string UserId)
        {

            return Json(ProfileManager.GetUserFileStream(UserId==null?CurrentUser.Id:UserId));

        }
        [HttpPost]
        public JsonResult GetUserInfo()
        {
            return Json(ProfileManager.GetUserInfo(CurrentUser.Id));

        }
        #region модератор
        [HttpPost]
        public void AcceptApplication(int ApplicationId)
        {
            //!проверить доступ
            ProfileManager.AcceptApplication(ApplicationId);

        }
        [HttpPost]
        public void DeclineApplication(int ApplicationId)
        {
            //!проверить доступ
            ProfileManager.DeclineApplication(ApplicationId);

        }
        [HttpPost]
        public void AddNews(string Text, DateTime dateTime )
        {
            //!проверить доступ
            ProfileManager.AddNews(CurrentUser.Id, Text, dateTime);

        }
        [HttpPost]
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
    }
}