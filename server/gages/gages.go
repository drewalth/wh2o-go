package gages

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"reflect"
)

func FetchGageReadings() {

	resp, err := http.Get("https://pokeapi.co/api/v2/pokemon/ditto")

	if err != nil {
		log.Fatalln(err)
	}

	body, err := ioutil.ReadAll(resp.Body)

	if err != nil {
		log.Fatalln(err)
	}

	sb := string(body)
	fmt.Println(reflect.TypeOf(sb))

}
