﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApp.Models.News
{
    public class CommentModel
    {
        public int Id { get; set; }

        public Guid UserId { get; set; }

        public string AuthorName { get; set; }

        public DateTime  DateTimeOfCreation{ get; set; }

        public int ApplicationId { get; set; }

        public string Text { get; set; }

        public int ParentCommentId { get; set; }
        public List<CommentModel> Children { get; set; }
    }
}