"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  value?: string
  onChange?: (date: string) => void
  id?: string
  placeholder?: string
}

export function DatePicker({
  value,
  onChange,
  id,
  placeholder,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const date = value ? new Date(value + "T00:00:00") : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          id={id}
          className="w-full justify-start font-normal"
        >
          {date ? date.toLocaleDateString() : (placeholder ?? "Seleccionar fecha")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          defaultMonth={date}
          captionLayout="dropdown"
          onSelect={(newDate) => {
            if (newDate) {
              const year = newDate.getFullYear()
              const month = String(newDate.getMonth() + 1).padStart(2, "0")
              const day = String(newDate.getDate()).padStart(2, "0")
              onChange?.(`${year}-${month}-${day}`)
              setOpen(false)
            }
          }}
        />
      </PopoverContent>
    </Popover>
  )
}