using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;
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

        public int DepartmentId { get; set; }

        public int ReasonId { get; set; }

        public string Longitude { get; set; }

        public bool IsActive { get; set; }

        public string Latitude { get; set; }

        public List<CommentModel> Comments { get; set; }


        public UploadFile[] Files { get; set; }
    }
}