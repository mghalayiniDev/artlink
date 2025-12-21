import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'
 
const SUPPORTED_LOCALES = ["en", "ar"]

export default getRequestConfig(async () => {
    const store = await cookies()
    let locale = store.get('locale')?.value || 'en'

    if (!SUPPORTED_LOCALES.includes(locale)) {
        locale = 'en'
    }
    
    return {
        locale,
        messages: (await import(`@/messages/${locale}.json`)).default
    }
})