﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;
using WebApp.Models.Application;
using WebApp.Models.Common;
using WebApp.Models.News;// это странно, ведь то,что нужно лежит в WebApp.Models

namespace WebApp.Models
{
    public class ApplicationModel
    {
        [Required]
        public int Id { get; set; }

        public string Title { get; set; }

        public string Text { get; set; }

        public string AddressText { get; set; }

        public int DepartmentId { get; set; }

        public int ReasonId { get; set; }

        public string Longitude { get; set; }

        public bool IsActive { get; set; }

        public int StatusId { get; set; }
        public int PosCount { get; set; }
        public int NegCount { get; set; }

        public string Latitude { get; set; }
        public ApplicationInfo Info { get; set; }

        public List<CommentModel> Comments { get; set; }


        public List<UploadFile> Files { get; set; }
    }
}