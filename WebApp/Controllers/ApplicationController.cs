using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using WebApp.Models;
using WebApp.Models.Managers;

namespace WebApp.Controllers
{
    public class ApplicationController : Controller
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
        [System.Web.Mvc.HttpPost]
        public JsonResult SubmitApplication(ApplicationModel model)
        {
            ApplicationUser user = ApplicationUserManager.FindByName(User.Identity.Name);
            return Json(ApplicationManager.SubmitApplication(model, user.Id));
        }

        public JsonResult GetReasonsByDepartment(int Id)
        {
            return Json(ApplicationManager.GetReasonsByDepartment(Id));
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