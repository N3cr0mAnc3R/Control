﻿using Microsoft.AspNet.Identity.Owin;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using WebApp.Models;
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
        public JsonResult SelectCommentsByApplicationId (int ApplicationId)
        {
            return Json(ProfileManager.SelectCommentsByApplicationId(ApplicationId));
        }
        [HttpPost]
        public void AddComment( int ApplicationId, string Text, int? ParentCommentId)
        {
            ProfileManager.AddComment(CurrentUser.Id, ApplicationId, Text, ParentCommentId);
            SelectCommentsByApplicationId( ApplicationId);
        }
        protected ProfileManager ProfileManager
        {
            get
            {
                return Request.GetOwinContext().Get<ProfileManager>();
            }
        }
    }
}