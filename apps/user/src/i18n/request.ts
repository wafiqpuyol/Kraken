import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import { GetRequestConfigParams } from "../../../../node_modules/next-intl/dist/types/src/server/react-server/getRequestConfig"

export default getRequestConfig(async ({ locale }: GetRequestConfigParams) => {
    // Validate that the incoming `locale` parameter is valid
    if (!routing.locales.includes(locale as any)) notFound();

    return {
        messages: (await import(`../../messages/${locale}.json`)).default
    };
});