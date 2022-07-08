package user

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm/clause"
	"net/http"
	"wh2o-go/common"
	"wh2o-go/model"
)

func GetUser(c *gin.Context) {

	var u struct {
		ID int `uri:"id"`
	}

	var userFromDb model.User

	if c.ShouldBindUri(&u) == nil {

		db := common.GetDB(c)

		res := db.Where("id = ?", u.ID).First(&userFromDb)

		common.CheckError(res.Error)

		c.JSON(http.StatusOK, userFromDb)

	} else {
		c.JSON(http.StatusBadRequest, "bad request")
	}

}

func Update(c *gin.Context) {

	var user model.User

	if c.ShouldBind(&user) == nil {

		db := common.GetDB(c)

		res := db.Where("id = ?", user.ID).Clauses(clause.Returning{}).Updates(&user)

		common.CheckError(res.Error)

		c.JSON(http.StatusOK, user)

	} else {
		c.JSON(http.StatusBadRequest, "bad request")
	}

}
