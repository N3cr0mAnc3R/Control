﻿using DarkSide;
using System;
using Dapper;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using WebApp.Models;

namespace WebApp.Models.Managers
{
    public class ApplicationManager : Manager
    {
        public ApplicationManager(Concrete concrete) : base(concrete) { }
        public IEnumerable<IndexType> SelectAllDepartments()
        {
            using (var cnt = Concrete.OpenConnection())
            {
                return cnt.Query<IndexType>(
                    sql: "dbo.SelectAllDepartments",
                    commandType: CommandType.StoredProcedure
                );

            }
        }

        public IEnumerable<IndexType> GetReasonsByDepartment(int id)
        {
            using (var cnt = Concrete.OpenConnection())
            {
                return cnt.Query<IndexType>(
                    sql: "dbo.GetReasonsByDepartment",
                    param: new { DepartmentId = id },
                    commandType: CommandType.StoredProcedure
                );

            }
        }

        public IEnumerable<int> SubmitApplication(string uid, string text, bool isActive,
                                    int posCount, int negCount, int reasonId,
                                    float longitude, float latitude)
        {
            using (var cnt = Concrete.OpenConnection())
            {
                return cnt.Query<int>(
                    sql: "dbo.AddApplication",
                    param: new { UserId = uid, Text = text, IsActive = isActive, PosCount=posCount, NegCount = negCount, ReasonId = reasonId, Longitude = longitude, Latitude = latitude},
                    commandType: CommandType.StoredProcedure
                );

            }
        }

    }



}