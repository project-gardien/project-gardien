import { localeLabels } from '#/lib/locales'
import { locales } from '#/schemas/locale'
import type { Locale } from '#/schemas/locale'

type Props = {
  value: Locale[]
  onChange: (offered: Locale[]) => void
}

export function LocaleCheckboxes({ value, onChange }: Props) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-sm font-medium">Languages offered</legend>
      <div className="flex gap-4">
        {locales.map((locale) => (
          <label key={locale} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4 accent-primary"
              checked={value.includes(locale)}
              onChange={(event) =>
                onChange(locales.filter((other) => (other === locale ? event.target.checked : value.includes(other))))
              }
            />
            {localeLabels[locale]}
          </label>
        ))}
      </div>
    </fieldset>
  )
}
