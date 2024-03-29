﻿using DarkSide;
using System;
using Dapper;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using WebApp.Models.News;

namespace WebApp.Models.Managers
{
    public class NewsManager:Manager
    {
        public NewsManager(Concrete concrete) : base(concrete) { }
        public IEnumerable<New> ShowFreshNews(DateTime date)
        {
            using (var cnt = Concrete.OpenConnection())
            {
                return cnt.Query<New>(
                    sql: "dbo.ShowFreshNews",
                    param:new { date }, // параметр из хранимки = название переменной
                    commandType: CommandType.StoredProcedure
                );
            }
        }
        public IEnumerable<New> ShowAllNews()
        {
            using (var cnt = Concrete.OpenConnection())
            {
                return cnt.Query<New>(
                    sql: "dbo.ShowAllNews",
                  
                    commandType: CommandType.StoredProcedure
                );
            }
        }
        public New GetNewById(int Id)
        {
            using (var cnt = Concrete.OpenConnection())
            {
                return (cnt.Query<New>(
                    sql: "dbo.GetNewById",
                  param: new {Id},
                    commandType: CommandType.StoredProcedure
                )).First();
            }
        }
    }
}