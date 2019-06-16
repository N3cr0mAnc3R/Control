using Microsoft.AspNet.Identity.Owin;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using WebApp.Models.Managers;

namespace WebApp.Controllers
{
    public class HomeController : BaseController
    {
        public ActionResult Index()
        {
            return View();
        }

        [AllowAnonymous]
        public ActionResult Application(int? Id)
        {
            if (Id == null)
            {
                return Redirect("/");
            }
            return View();
        }
        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }

        [HttpPost]
        public JsonResult ShowAllNews()
        {
            return Json(NewsManager.ShowAllNews());
        }

        [HttpPost]
        public JsonResult GetApplicationsWithCoords()
        {
            return Json(MainManager.GetApplicationsWithCoords());
        }

        [HttpPost]
        public JsonResult GetTopApplications()
        {
            return Json(MainManager.GetTopApplications());
        }

        protected NewsManager NewsManager
        {
            get
            {
                return Request.GetOwinContext().Get<NewsManager>();

            }
        }

        protected MainManager MainManager
        {
            get
            {
                return Request.GetOwinContext().Get<MainManager>();

            }
        }
    }
}