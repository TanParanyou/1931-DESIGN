package utils

import "errors"

var (
	ErrNotFound       = errors.New("record not found")
	ErrInternalServer = errors.New("internal server error")
	ErrBadRequest     = errors.New("bad request")
)
