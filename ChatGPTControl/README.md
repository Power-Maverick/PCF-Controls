# Chat GPT Control

[![GitHub Releases](https://img.shields.io/static/v1?label=Download&message=Chat%20GPT&style=for-the-badge&logo=microsoft&color=brightgreen)](https://github.com/Power-Maverick/PCF-Controls/releases/tag/ChatGPTControl-v.1.0.1)

A control that provides ability to run Chat GPT inside Power Apps. Saves the context so that you can start from where you left-off.

### Configure the control

Control has 3 configuration properities which are described below:

| Configuration Property | Description                                 | Required |
| ---------------------- | ------------------------------------------- | -------- |
| Primary                | The bound field that needs to show Chat GPT | Yes      |
| Chat GPT Organization  | Add your Chat GPT organization id           | Yes      |
| Chat GPT API Key       | Add your Chat GPT API Key                   | Yes      |

### Chat GPT Details

In order to fetch the organization id and API Key; log into your Chat GPT account and then navigate to [this link](https://platform.openai.com/). Using the profile picture in the top right corner select "Manage Account" > "Settings". You will find your organization id. To create API Key, same using the profile picture, but this time click "View API Keys". Click create if you don't already have one and copy the "secret" as you won't be able to recover it later.

Ref.: [Chat GPT API Documentation](https://platform.openai.com/docs/guides/chat)

### Screenshot of the configuration

![Configuration](assets/configuration.png)

### Demo Screenshot

![Chat GPT Control](assets/screenshot.png)

### Demo Video

[![Chat GPT Control-DemoVideo](https://img.youtube.com/vi/qDMOvLGCzHM/0.jpg)](https://www.youtube.com/watch?v=qDMOvLGCzHM)
