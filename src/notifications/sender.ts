import { config } from '@/config'
import { PUSHOVER } from '@/constants'
import { logger } from '@/lib'

interface SendNotificationOptions {
  title: string
  message: string
  priority: number
  retry?: number
  expire?: number
  url?: string
  urlTitle?: string
}

interface PushoverPayload {
  token: string
  user: string
  message: string
  title: string
  priority: number
  sound: string
  url?: string
  url_title?: string
  retry?: number
  expire?: number
}

interface PushoverResponse {
  status?: number
  request?: string
  errors?: string[]
}

export async function sendNotification(
  options: SendNotificationOptions,
): Promise<void> {
  const { title, message, priority, retry, expire, url, urlTitle } = options
  const { appToken, userKey, sound } = config.pushover

  const payload: PushoverPayload = {
    token: appToken,
    user: userKey,
    message,
    title,
    priority,
    sound,
    url,
    url_title: urlTitle,
  }

  // Only include retry and expire for emergency priority (2)
  if (priority === PUSHOVER.PRIORITY_EMERGENCY) {
    payload.retry = retry
    payload.expire = expire
  }

  try {
    const response = await fetch(PUSHOVER.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const result = (await response.json()) as PushoverResponse

    if (!response.ok) {
      logger.error('Pushover API error', result)
      throw new Error(
        `Pushover notification failed: ${result.errors?.join(', ') || 'Unknown error'}`,
      )
    }

    logger.info('Pushover notification sent successfully', result)
  } catch (error) {
    logger.error('Error sending Pushover notification', error)
    throw error
  }
}
