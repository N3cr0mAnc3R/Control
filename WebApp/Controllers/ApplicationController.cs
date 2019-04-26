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


        public ActionResult SubmitApplication(ApplicationModel model)
        {
            if (ModelState.IsValid)
            {

                 return View();
            }

            return View();

        }

        public JsonResult GetReasonsByDepartment(int Id)
        {
            return Json(ApplicationManager.GetReasonsByDepartment(Id));
        }

        public JsonResult SubmitApplication(string uid, string text, bool isActive,
                                    int posCount, int negCount, int reasonId,
                                    float longitude, float latitude)
        {
            return Json(ApplicationManager.SubmitApplication(uid, text, isActive, posCount, negCount, reasonId, longitude, latitude));
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