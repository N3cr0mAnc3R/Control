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
    public class ApplicationController : BaseController
    {
        [AllowAnonymous]
        public ActionResult GetApplication()
        {
            ViewBag.News = NewsManager.ShowFreshNews(DateTime.Now);
            ViewBag.Departments = ApplicationManager.SelectAllDepartments();
            ViewBag.Reasons = ApplicationManager.GetReasonsByDepartment(1);

            return View();
        }
        protected ApplicationUserManager ApplicationUserManager
        {
            get
            {
                return Request.GetOwinContext().Get<ApplicationUserManager>();
            }
        }
        [HttpPost]
        public async Task<JsonResult> SubmitApplication(ApplicationModel model)
        {
            model.Files = new List<UploadFile>();
            for (int i = 0; i < Request.Files.Count; i++)
            {
                UploadFile file = new UploadFile();
                file.File = Request.Files.Get(i);
                model.Files.Add(file);
            }
            if (!User.Identity.IsAuthenticated)
            {
                TempData["application"] = model;
                return Json("auth");
            }

            //return Json(new { value = 10});
            await ApplicationManager.SubmitApplication(model, CurrentUser.Id);
            return Json("");
            //return Json(ApplicationManager.SubmitApplication(model, CurrentUser.Id));
        }
        //[HttpPost]
        //[Authorize]
        //public JsonResult SubmitApplication(ApplicationModel model)
        //{
        //    model.Files = new List<UploadFile>();
        //    for (int i = 0; i < Request.Files.Count; i++)
        //    {
        //        UploadFile file = new UploadFile();
        //        file.File = Request.Files.Get(i);
        //        model.Files.Add(file);
        //    }
        //    if (!User.Identity.IsAuthenticated)
        //    {
        //        TempData["application"] = model;
        //    }
        //    //return Json(new { value = 10});
        //    return Json(ApplicationManager.SubmitApplication(model, CurrentUser.Id));
        //}
        [AllowAnonymous]
        public JsonResult GetReasonsByDepartment(int Id)
        {
            return Json(ApplicationManager.GetReasonsByDepartment(Id));
        }

        [AllowAnonymous]
        public JsonResult GetApplicationImages(int Id)
        {
            return Json(ApplicationManager.GetFileStream(Id));

        }

        public JsonResult FileUpload(UploadFile uploadFile, int applicationId )
        {
            if (ModelState.IsValid)
            {
                ApplicationUser user = ApplicationUserManager.FindByName(User.Identity.Name);
                return Json(ApplicationManager.FileUpload(uploadFile.File.InputStream, uploadFile.File.ContentType, applicationId, Path.GetExtension(uploadFile.File.FileName), user.Id, uploadFile.File.FileName));
            }
            throw new ArgumentException();
        }
        #region Like/dislike
        public JsonResult GetLikeDislike(int applicationId)
        {
            ApplicationUser user = ApplicationUserManager.FindByName(User.Identity.Name);
            int contribution = ApplicationManager.GetLikeDislike(user.Id, applicationId);
            
            return Json(contribution);
        }
        public JsonResult GetPosNegCount(int applicationId)
        {
            PosNegCount pnc = ApplicationManager.GetPosNegCount(applicationId);
            return Json(pnc);
        }
        public JsonResult Like(int applicationId)
        {
            ApplicationUser user = ApplicationUserManager.FindByName(User.Identity.Name);
            int contribution =  ApplicationManager.GetLikeDislike(user.Id, applicationId);
            if (contribution == 0) // Поставь лайк
            {
                ApplicationManager.SetLikeDislike(user.Id, applicationId, 1);
                ApplicationManager.ChangePosCount(applicationId, 1);
            }
            else if (contribution < 0) // Убери дизлайк и поставь лайк
            {
                ApplicationManager.SetLikeDislike(user.Id, applicationId, 1);
                ApplicationManager.ChangePosCount(applicationId, 1);
                ApplicationManager.ChangeNegCount(applicationId, -1);
            }
            else // Убери лайк
            {
                ApplicationManager.SetLikeDislike(user.Id, applicationId, 0);
                ApplicationManager.ChangePosCount(applicationId, -1);
            }
            
            return Json(ApplicationManager.GetPosNegCount(applicationId));
           
        }
        public JsonResult Dislike(int applicationId)
        {
            ApplicationUser user = ApplicationUserManager.FindByName(User.Identity.Name);
            int contribution = ApplicationManager.GetLikeDislike(user.Id, applicationId);
            if (contribution == 0) // Поставь дизлайк
            {
                ApplicationManager.SetLikeDislike(user.Id, applicationId, -1);
                ApplicationManager.ChangeNegCount(applicationId, 1);
            }
            else if (contribution < 0) // Убери дизлайк
            {
                ApplicationManager.SetLikeDislike(user.Id, applicationId, 0);
                ApplicationManager.ChangeNegCount(applicationId, -1);
            }
            else // Убери лайк и поставь дизлайк
            {
                ApplicationManager.SetLikeDislike(user.Id, applicationId, -1);
                ApplicationManager.ChangePosCount(applicationId, -1);
                ApplicationManager.ChangeNegCount(applicationId, 1);
            }
            return Json(ApplicationManager.GetPosNegCount(applicationId));
        }
        #endregion


        protected NewsManager NewsManager
        {
            get
            {
                return Request.GetOwinContext().Get<NewsManager>();
            }
        }
        protected ApplicationManager ApplicationManager
        {
            get
            {
                return Request.GetOwinContext().Get<ApplicationManager>();
            }
        }



    }
}