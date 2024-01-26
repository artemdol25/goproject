package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

type StatsService struct {
	mu              sync.Mutex
	createdNoteStat int
}

func (s *StatsService) IncrementCreatedNote() {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.createdNoteStat++
}

func (s *StatsService) GetStats() int {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.createdNoteStat
}

func main() {
	statsService := &StatsService{}

	r := mux.NewRouter()

	r.HandleFunc("/stats/increment", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			statsService.IncrementCreatedNote()
			w.WriteHeader(http.StatusOK)
			fmt.Fprint(w, `{"message": "Статистика успешно увеличена"}`)
		} else {
			http.Error(w, "Метод не поддерживается", http.StatusMethodNotAllowed)
		}
	})

	r.HandleFunc("/stats", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			stats := statsService.GetStats()
			response := map[string]int{"created_notes": stats}
			jsonResponse(w, response)
		} else {
			http.Error(w, "Метод не поддерживается", http.StatusMethodNotAllowed)
		}
	})

	r.HandleFunc("/stats/reset", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			statsService.mu.Lock()
			defer statsService.mu.Unlock()
			statsService.createdNoteStat = 0
			w.WriteHeader(http.StatusOK)
			fmt.Fprint(w, `{"message": "Статистика успешно обнулена"}`)
		} else {
			http.Error(w, "Метод не поддерживается", http.StatusMethodNotAllowed)
		}
	})

	c := cors.New(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders: []string{"*"},
	})

	handler := c.Handler(r)

	port := 8001
	log.Printf("Запуск сервера на порту %d...\n", port)
	err := http.ListenAndServe(fmt.Sprintf(":%d", port), handler)
	if err != nil {
		log.Fatal("Ошибка запуска сервера: ", err)
	}
}

func jsonResponse(w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(data)
}
