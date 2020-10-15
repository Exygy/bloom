import * as React from "react"
import "./GridSection.scss"

export interface GridCellProps {
  children: React.ReactNode
  span?: number
  className?: string
}

const GridCell = (props: GridCellProps) => {
  const gridCellClasses = ["grid-item"]
  if (props.span) gridCellClasses.push(`md:col-span-${props.span}`)
  if (props.className) gridCellClasses.push(props.className)

  return <article className={gridCellClasses.join(" ")}>{props.children}</article>
}

export interface GridSectionProps {
  title?: string
  edit?: string
  subtitle?: string
  tinted?: boolean
  grid?: boolean
  columns?: number
  inset?: boolean
  className?: string
  children: React.ReactNode
}

const GridSection = (props: GridSectionProps) => {
  const gridClasses = ["grid-section__inner"]
  const grid = typeof props.grid != "undefined" ? props.grid : true
  if (props.tinted) gridClasses.push("is-tinted")
  if (props.inset) gridClasses.push("is-inset")
  if (grid) {
    const columns = props.columns || 3
    gridClasses.push(`md:grid md:grid-cols-${columns} md:gap-8`)
  }
  if (props.className) gridClasses.push(props.className)

  const headerClasses = ["grid-section__header"]
  if (props.subtitle && (!props.title || !props.inset)) headerClasses.push("mb-0")

  const subtitleClasses = ["grid-section__subtitle"]
  if (props.title) subtitleClasses.push("mt-4")

  return (
    <section className="grid-section">
      {(props.title || props.subtitle) && (
        <header className={headerClasses.join(" ")}>
          {props.title && <h2 className="grid-section__title">{props.title}</h2>}
          {props.edit && (
            <span className="ml-auto">
              <a className="edit-link">{props.edit}</a>
            </span>
          )}
          {props.subtitle && <h3 className={subtitleClasses.join(" ")}>{props.subtitle}</h3>}
        </header>
      )}

      <div className={gridClasses.join(" ")}>{props.children}</div>
    </section>
  )
}

export { GridSection as default, GridSection, GridCell }
