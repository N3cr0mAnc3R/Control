﻿using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Net;
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
            if((model.Latitude == "" || model.Latitude == "undefined") && model.AddressText != "")
            {
                string[] gotCoords = YMapsTextToCoordinates(model.AddressText);
                model.Latitude = gotCoords[1];
                model.Longitude = gotCoords[0];
            }
            model.Files = new List<UploadFile>();
            for (int i = 0; i < Request.Files.Count; i++)
            {
                UploadFile file = new UploadFile();
                file.File = Request.Files.Get(i);
                model.Files.Add(file);
            }
            if (!User.Identity.IsAuthenticated)
            {
                foreach (UploadFile file in model.Files)
                {
                    file.FileId = ApplicationManager.UploadFileWithoutSecurity(file.File.InputStream, file.File.ContentType, Path.GetExtension(file.File.FileName), file.File.FileName);
                }

                TempData["application"] = model;
                return Json("auth");
            }
            await ApplicationManager.SubmitApplication(model, CurrentUser.Id);
            return Json("");
        }
        public string[] YMapsTextToCoordinates(string textAddress)
        {
            // http://localhost:60483/application/YMapsTextToCoordinates
            string geocode = (textAddress.Trim()).Replace(' ', ('+'));
            double[] coords = new double[2];
            string site = "https://geocode-maps.yandex.ru/1.x/?apikey=3936ff9e-b64c-4aef-8fe1-b6bc0a4e5fe7&geocode="+geocode;

            HttpWebRequest req = (HttpWebRequest)HttpWebRequest.Create(site);
            HttpWebResponse resp = (HttpWebResponse)req.GetResponse();

            using (StreamReader stream = new StreamReader(
                 resp.GetResponseStream(), Encoding.UTF8))
            {
                string Text = stream.ReadToEnd();
                string bothCoords = "";
                if (Text.Contains("<pos>") && Text.Contains("</pos>"))
                {
                    int Start = Text.IndexOf("<pos>", 0) + "<pos>".Length;
                    int End = Text.IndexOf("</pos>", Start);
                    bothCoords = (Text.Substring(Start, End - Start)).Replace('.',',');
                }

                string[] stringCoords = bothCoords.Split(' ');
                //for (int i = 0; i < 2; i++)
                //{
                //    coords[i] = Convert.ToDouble(stringCoords[1 - i]);
                //}

                return stringCoords;
            }
        }
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