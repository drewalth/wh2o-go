package alerts

import (
	"fmt"
	database "wh2o-next/server/database"
)

func AlertFindOne(alertId int) []database.Gage {

	fmt.Println("Alert get handler")

	result := database.FindGages()

	return result
}
