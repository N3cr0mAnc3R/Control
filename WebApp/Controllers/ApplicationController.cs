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
        public JsonResult SubmitApplication(ApplicationModel model)
        {
            model.Files = new List<UploadFile>();
            for (int i = 0; i < Request.Files.Count; i++)
            {
                UploadFile file = new UploadFile();
                file.File = Request.Files.Get(i);
                model.Files.Add(file);
            }
             
            //return Json(new { value = 10});
            return Json(ApplicationManager.SubmitApplication(model, CurrentUser.Id));
        }

        public JsonResult GetReasonsByDepartment(int Id)
        {
            return Json(ApplicationManager.GetReasonsByDepartment(Id));
        }

        public IEnumerable<FileResult> GetApplicationImages(int Id)
        {

            IEnumerable<Models.FileStreamDownload> fsrCollection = ApplicationManager.GetFileStream(Id);
            List<System.Web.Mvc.FileStreamResult> listofFSR = new List<System.Web.Mvc.FileStreamResult>();
            foreach (Models.FileStreamDownload fsd in fsrCollection)
            {
                listofFSR.Add( new System.Web.Mvc.FileStreamResult(fsd.Stream, fsd.ContentType)
                {
                    FileDownloadName = fsd.Name
                });
            }
            return listofFSR;

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