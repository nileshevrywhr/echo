# List voices

GET https://api.elevenlabs.io/v2/voices

Gets a list of all available voices for a user with search, filtering and pagination.

Reference: https://elevenlabs.io/docs/api-reference/voices/search

## OpenAPI Specification

```yaml
openapi: 3.1.1
info:
  title: List voices
  version: endpoint_voices.search
paths:
  /v2/voices:
    get:
      operationId: search
      summary: List voices
      description: >-
        Gets a list of all available voices for a user with search, filtering
        and pagination.
      tags:
        - - subpackage_voices
      parameters:
        - name: next_page_token
          in: query
          description: >-
            The next page token to use for pagination. Returned from the
            previous request.
          required: false
          schema:
            type:
              - string
              - 'null'
        - name: page_size
          in: query
          description: >-
            How many voices to return at maximum. Can not exceed 100, defaults
            to 10. Page 0 may include more voices due to default voices being
            included.
          required: false
          schema:
            type: integer
        - name: search
          in: query
          description: >-
            Search term to filter voices by. Searches in name, description,
            labels, category.
          required: false
          schema:
            type:
              - string
              - 'null'
        - name: sort
          in: query
          description: >-
            Which field to sort by, one of 'created_at_unix' or 'name'.
            'created_at_unix' may not be available for older voices.
          required: false
          schema:
            type:
              - string
              - 'null'
        - name: sort_direction
          in: query
          description: Which direction to sort the voices in. 'asc' or 'desc'.
          required: false
          schema:
            type:
              - string
              - 'null'
        - name: voice_type
          in: query
          description: >-
            Type of the voice to filter by. One of 'personal', 'community',
            'default', 'workspace', 'non-default'. 'non-default' is equal to all
            but 'default'.
          required: false
          schema:
            type:
              - string
              - 'null'
        - name: category
          in: query
          description: >-
            Category of the voice to filter by. One of 'premade', 'cloned',
            'generated', 'professional'
          required: false
          schema:
            type:
              - string
              - 'null'
        - name: fine_tuning_state
          in: query
          description: >-
            State of the voice's fine tuning to filter by. Applicable only to
            professional voices clones. One of 'draft', 'not_verified',
            'not_started', 'queued', 'fine_tuning', 'fine_tuned', 'failed',
            'delayed'
          required: false
          schema:
            type:
              - string
              - 'null'
        - name: collection_id
          in: query
          description: Collection ID to filter voices by.
          required: false
          schema:
            type:
              - string
              - 'null'
        - name: include_total_count
          in: query
          description: >-
            Whether to include the total count of voices found in the response.
            Incurs a performance cost.
          required: false
          schema:
            type: boolean
        - name: voice_ids
          in: query
          description: Voice IDs to lookup by. Maximum 100 voice IDs.
          required: false
          schema:
            type:
              - array
              - 'null'
            items:
              type: string
        - name: xi-api-key
          in: header
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Successful Response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GetVoicesV2ResponseModel'
        '422':
          description: Validation Error
          content: {}
components:
  schemas:
    SpeakerSeparationResponseModelStatus:
      type: string
      enum:
        - value: not_started
        - value: pending
        - value: completed
        - value: failed
    UtteranceResponseModel:
      type: object
      properties:
        start:
          type: number
          format: double
        end:
          type: number
          format: double
      required:
        - start
        - end
    SpeakerResponseModel:
      type: object
      properties:
        speaker_id:
          type: string
        duration_secs:
          type: number
          format: double
        utterances:
          type:
            - array
            - 'null'
          items:
            $ref: '#/components/schemas/UtteranceResponseModel'
      required:
        - speaker_id
        - duration_secs
    SpeakerSeparationResponseModel:
      type: object
      properties:
        voice_id:
          type: string
        sample_id:
          type: string
        status:
          $ref: '#/components/schemas/SpeakerSeparationResponseModelStatus'
        speakers:
          type:
            - object
            - 'null'
          additionalProperties:
            $ref: '#/components/schemas/SpeakerResponseModel'
        selected_speaker_ids:
          type:
            - array
            - 'null'
          items:
            type: string
      required:
        - voice_id
        - sample_id
        - status
    SampleResponseModel:
      type: object
      properties:
        sample_id:
          type: string
        file_name:
          type: string
        mime_type:
          type: string
        size_bytes:
          type: integer
        hash:
          type: string
        duration_secs:
          type:
            - number
            - 'null'
          format: double
        remove_background_noise:
          type:
            - boolean
            - 'null'
        has_isolated_audio:
          type:
            - boolean
            - 'null'
        has_isolated_audio_preview:
          type:
            - boolean
            - 'null'
        speaker_separation:
          oneOf:
            - $ref: '#/components/schemas/SpeakerSeparationResponseModel'
            - type: 'null'
        trim_start:
          type:
            - integer
            - 'null'
        trim_end:
          type:
            - integer
            - 'null'
    VoiceResponseModelCategory:
      type: string
      enum:
        - value: generated
        - value: cloned
        - value: premade
        - value: professional
        - value: famous
        - value: high_quality
    FineTuningResponseModelState:
      type: string
      enum:
        - value: not_started
        - value: queued
        - value: fine_tuning
        - value: fine_tuned
        - value: failed
        - value: delayed
    RecordingResponseModel:
      type: object
      properties:
        recording_id:
          type: string
        mime_type:
          type: string
        size_bytes:
          type: integer
        upload_date_unix:
          type: integer
        transcription:
          type: string
      required:
        - recording_id
        - mime_type
        - size_bytes
        - upload_date_unix
        - transcription
    VerificationAttemptResponseModel:
      type: object
      properties:
        text:
          type: string
        date_unix:
          type: integer
        accepted:
          type: boolean
        similarity:
          type: number
          format: double
        levenshtein_distance:
          type: number
          format: double
        recording:
          oneOf:
            - $ref: '#/components/schemas/RecordingResponseModel'
            - type: 'null'
      required:
        - text
        - date_unix
        - accepted
        - similarity
        - levenshtein_distance
    ManualVerificationFileResponseModel:
      type: object
      properties:
        file_id:
          type: string
        file_name:
          type: string
        mime_type:
          type: string
        size_bytes:
          type: integer
        upload_date_unix:
          type: integer
      required:
        - file_id
        - file_name
        - mime_type
        - size_bytes
        - upload_date_unix
    ManualVerificationResponseModel:
      type: object
      properties:
        extra_text:
          type: string
        request_time_unix:
          type: integer
        files:
          type: array
          items:
            $ref: '#/components/schemas/ManualVerificationFileResponseModel'
      required:
        - extra_text
        - request_time_unix
        - files
    FineTuningResponseModel:
      type: object
      properties:
        is_allowed_to_fine_tune:
          type: boolean
        state:
          type: object
          additionalProperties:
            $ref: '#/components/schemas/FineTuningResponseModelState'
        verification_failures:
          type: array
          items:
            type: string
        verification_attempts_count:
          type: integer
        manual_verification_requested:
          type: boolean
        language:
          type:
            - string
            - 'null'
        progress:
          type:
            - object
            - 'null'
          additionalProperties:
            type: number
            format: double
        message:
          type:
            - object
            - 'null'
          additionalProperties:
            type: string
        dataset_duration_seconds:
          type:
            - number
            - 'null'
          format: double
        verification_attempts:
          type:
            - array
            - 'null'
          items:
            $ref: '#/components/schemas/VerificationAttemptResponseModel'
        slice_ids:
          type:
            - array
            - 'null'
          items:
            type: string
        manual_verification:
          oneOf:
            - $ref: '#/components/schemas/ManualVerificationResponseModel'
            - type: 'null'
        max_verification_attempts:
          type:
            - integer
            - 'null'
        next_max_verification_attempts_reset_unix_ms:
          type:
            - integer
            - 'null'
        finetuning_state:
          description: Any type
    VoiceSettingsResponseModel:
      type: object
      properties:
        stability:
          type:
            - number
            - 'null'
          format: double
        use_speaker_boost:
          type:
            - boolean
            - 'null'
        similarity_boost:
          type:
            - number
            - 'null'
          format: double
        style:
          type:
            - number
            - 'null'
          format: double
        speed:
          type:
            - number
            - 'null'
          format: double
    voice_sharing_state:
      type: string
      enum:
        - value: enabled
        - value: disabled
        - value: copied
        - value: copied_disabled
    VoiceSharingResponseModelCategory:
      type: string
      enum:
        - value: generated
        - value: cloned
        - value: premade
        - value: professional
        - value: famous
        - value: high_quality
    review_status:
      type: string
      enum:
        - value: not_requested
        - value: pending
        - value: declined
        - value: allowed
        - value: allowed_with_changes
    VoiceSharingModerationCheckResponseModel:
      type: object
      properties:
        date_checked_unix:
          type:
            - integer
            - 'null'
        name_value:
          type:
            - string
            - 'null'
        name_check:
          type:
            - boolean
            - 'null'
        description_value:
          type:
            - string
            - 'null'
        description_check:
          type:
            - boolean
            - 'null'
        sample_ids:
          type:
            - array
            - 'null'
          items:
            type: string
        sample_checks:
          type:
            - array
            - 'null'
          items:
            type: number
            format: double
        captcha_ids:
          type:
            - array
            - 'null'
          items:
            type: string
        captcha_checks:
          type:
            - array
            - 'null'
          items:
            type: number
            format: double
    ReaderResourceResponseModelResourceType:
      type: string
      enum:
        - value: read
        - value: collection
    ReaderResourceResponseModel:
      type: object
      properties:
        resource_type:
          $ref: '#/components/schemas/ReaderResourceResponseModelResourceType'
        resource_id:
          type: string
      required:
        - resource_type
        - resource_id
    VoiceSharingResponseModel:
      type: object
      properties:
        status:
          $ref: '#/components/schemas/voice_sharing_state'
        history_item_sample_id:
          type:
            - string
            - 'null'
        date_unix:
          type: integer
        whitelisted_emails:
          type: array
          items:
            type: string
        public_owner_id:
          type: string
        original_voice_id:
          type: string
        financial_rewards_enabled:
          type: boolean
        free_users_allowed:
          type: boolean
        live_moderation_enabled:
          type: boolean
        rate:
          type:
            - number
            - 'null'
          format: double
        fiat_rate:
          type:
            - number
            - 'null'
          format: double
        notice_period:
          type: integer
        disable_at_unix:
          type:
            - integer
            - 'null'
        voice_mixing_allowed:
          type: boolean
        featured:
          type: boolean
        category:
          $ref: '#/components/schemas/VoiceSharingResponseModelCategory'
        reader_app_enabled:
          type:
            - boolean
            - 'null'
        image_url:
          type:
            - string
            - 'null'
        ban_reason:
          type:
            - string
            - 'null'
        liked_by_count:
          type: integer
        cloned_by_count:
          type: integer
        name:
          type: string
        description:
          type:
            - string
            - 'null'
        labels:
          type: object
          additionalProperties:
            type: string
        review_status:
          $ref: '#/components/schemas/review_status'
        review_message:
          type:
            - string
            - 'null'
        enabled_in_library:
          type: boolean
        instagram_username:
          type:
            - string
            - 'null'
        twitter_username:
          type:
            - string
            - 'null'
        youtube_username:
          type:
            - string
            - 'null'
        tiktok_username:
          type:
            - string
            - 'null'
        moderation_check:
          oneOf:
            - $ref: '#/components/schemas/VoiceSharingModerationCheckResponseModel'
            - type: 'null'
        reader_restricted_on:
          type:
            - array
            - 'null'
          items:
            $ref: '#/components/schemas/ReaderResourceResponseModel'
    VerifiedVoiceLanguageResponseModel:
      type: object
      properties:
        language:
          type: string
        model_id:
          type: string
        accent:
          type:
            - string
            - 'null'
        locale:
          type:
            - string
            - 'null'
        preview_url:
          type:
            - string
            - 'null'
      required:
        - language
        - model_id
    VoiceResponseModelSafetyControl:
      type: string
      enum:
        - value: NONE
        - value: BAN
        - value: CAPTCHA
        - value: ENTERPRISE_BAN
        - value: ENTERPRISE_CAPTCHA
    VoiceVerificationResponseModel:
      type: object
      properties:
        requires_verification:
          type: boolean
        is_verified:
          type: boolean
        verification_failures:
          type: array
          items:
            type: string
        verification_attempts_count:
          type: integer
        language:
          type:
            - string
            - 'null'
        verification_attempts:
          type:
            - array
            - 'null'
          items:
            $ref: '#/components/schemas/VerificationAttemptResponseModel'
      required:
        - requires_verification
        - is_verified
        - verification_failures
        - verification_attempts_count
    VoiceResponseModel:
      type: object
      properties:
        voice_id:
          type: string
        name:
          type: string
        samples:
          type:
            - array
            - 'null'
          items:
            $ref: '#/components/schemas/SampleResponseModel'
        category:
          $ref: '#/components/schemas/VoiceResponseModelCategory'
        fine_tuning:
          oneOf:
            - $ref: '#/components/schemas/FineTuningResponseModel'
            - type: 'null'
        labels:
          type: object
          additionalProperties:
            type: string
        description:
          type:
            - string
            - 'null'
        preview_url:
          type:
            - string
            - 'null'
        available_for_tiers:
          type: array
          items:
            type: string
        settings:
          oneOf:
            - $ref: '#/components/schemas/VoiceSettingsResponseModel'
            - type: 'null'
        sharing:
          oneOf:
            - $ref: '#/components/schemas/VoiceSharingResponseModel'
            - type: 'null'
        high_quality_base_model_ids:
          type: array
          items:
            type: string
        verified_languages:
          type:
            - array
            - 'null'
          items:
            $ref: '#/components/schemas/VerifiedVoiceLanguageResponseModel'
        safety_control:
          oneOf:
            - $ref: '#/components/schemas/VoiceResponseModelSafetyControl'
            - type: 'null'
        voice_verification:
          oneOf:
            - $ref: '#/components/schemas/VoiceVerificationResponseModel'
            - type: 'null'
        permission_on_resource:
          type:
            - string
            - 'null'
        is_owner:
          type:
            - boolean
            - 'null'
        is_legacy:
          type: boolean
        is_mixed:
          type: boolean
        favorited_at_unix:
          type:
            - integer
            - 'null'
        created_at_unix:
          type:
            - integer
            - 'null'
      required:
        - voice_id
    GetVoicesV2ResponseModel:
      type: object
      properties:
        voices:
          type: array
          items:
            $ref: '#/components/schemas/VoiceResponseModel'
        has_more:
          type: boolean
        total_count:
          type: integer
        next_page_token:
          type:
            - string
            - 'null'
      required:
        - voices
        - has_more
        - total_count

```

## SDK Code Examples

```go
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.elevenlabs.io/v2/voices"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("xi-api-key", "xi-api-key")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby
require 'uri'
require 'net/http'

url = URI("https://api.elevenlabs.io/v2/voices")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["xi-api-key"] = 'xi-api-key'

response = http.request(request)
puts response.read_body
```

```java
HttpResponse<String> response = Unirest.get("https://api.elevenlabs.io/v2/voices")
  .header("xi-api-key", "xi-api-key")
  .asString();
```

```php
<?php

$client = new \GuzzleHttp\Client();

$response = $client->request('GET', 'https://api.elevenlabs.io/v2/voices', [
  'headers' => [
    'xi-api-key' => 'xi-api-key',
  ],
]);

echo $response->getBody();
```

```csharp
var client = new RestClient("https://api.elevenlabs.io/v2/voices");
var request = new RestRequest(Method.GET);
request.AddHeader("xi-api-key", "xi-api-key");
IRestResponse response = client.Execute(request);
```

```swift
import Foundation

let headers = ["xi-api-key": "xi-api-key"]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.elevenlabs.io/v2/voices")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "GET"
request.allHTTPHeaderFields = headers

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

```typescript
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

async function main() {
    const client = new ElevenLabsClient({
        environment: "https://api.elevenlabs.io",
    });
    await client.voices.search({});
}
main();

```

```python
from elevenlabs import ElevenLabs

client = ElevenLabs(
    base_url="https://api.elevenlabs.io"
)

client.voices.search()

```