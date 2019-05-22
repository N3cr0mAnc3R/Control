//using Microsoft.AspNet.Identity.Owin;
//using System;
//using System.Collections.Generic;
//using System.IO;
//using System.Linq;
//using System.Web;
//using System.Web.Mvc;
//using WebApp.Models;
//using WebApp.Models.Common;
//using WebApp.Models.Managers;
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

        public bool CheckAccess(int Id)
        {
            return ProfileManager.CheckAccess(Id, CurrentUser.Id);
        }
        [HttpPost]
        public JsonResult SelectApplicationsByUserId()
        {
            return Json(ProfileManager.SelectApplicationsByUserId(CurrentUser.Id));
        }

        [HttpPost]
        public void ChangeApplication()
        {
            //в работе 
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
        public JsonResult FileUpload(UploadFile uploadFile)
        {
            if (ModelState.IsValid)
            {
                ApplicationUser user = ApplicationUserManager.FindByName(User.Identity.Name);
                return Json(ProfileManager.FileUpload(uploadFile.File.InputStream, uploadFile.File.ContentType, Path.GetExtension(uploadFile.File.FileName), user.Id, uploadFile.File.FileName));
            }
            throw new ArgumentException();
        }

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