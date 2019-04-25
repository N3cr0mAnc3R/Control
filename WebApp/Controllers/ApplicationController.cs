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
            return View();
        }


        public ActionResult SubmitApplication(ApplicationModel model)
        {
            if (ModelState.IsValid)
            {
                StringBuilder fileNames = new StringBuilder();
                fileNames.Append("<ul>");
                foreach (HttpPostedFileBase file in model.Files)
                {
                    //You can do something with the files here like save them to disk
                    fileNames.Append("<li>");
                    fileNames.Append(file.FileName);
                    fileNames.Append("</li>");
                }
                fileNames.Append("</ul>");
                TempData["FileNames"] = fileNames.ToString();
                 return View();
            }

            return View();

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