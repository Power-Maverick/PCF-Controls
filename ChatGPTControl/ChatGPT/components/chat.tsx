/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useEffect } from "react";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import { FocusZone, FocusZoneDirection } from "@fluentui/react/lib/FocusZone";
import { List } from "@fluentui/react/lib/List";
import { getFocusStyle, getTheme, ITheme, mergeStyleSets } from "@fluentui/react/lib/Styling";
import { TextField } from "@fluentui/react/lib/TextField";
import { IconButton } from "@fluentui/react/lib/Button";
import { IIconProps } from "@fluentui/react/lib/Icon";
import { Image, IImageProps } from "@fluentui/react/lib/Image";
import { Spinner } from "@fluentui/react/lib/Spinner";

export interface IChatListProps {
    chatMessages?: Array<ChatCompletionRequestMessage>;
    organization?: string;
    apiKey?: string;
    relayUpdates: (newData: ChatCompletionRequestMessage) => void;
}

const theme: ITheme = getTheme();
const { palette, semanticColors, fonts } = theme;
const classNames = mergeStyleSets({
    itemCell: [
        getFocusStyle(theme, { inset: -1 }),
        {
            minHeight: 54,
            padding: 10,
            boxSizing: "border-box",
            borderBottom: `1px solid ${semanticColors.bodyDivider}`,
            display: "flex",
            selectors: {
                "&:hover": { background: palette.neutralLight },
            },
        },
    ],
    itemImage: {
        flexShrink: 0,
        paddingRight: 10,
    },
    itemContent: {
        marginLeft: 10,
        overflow: "hidden",
        flexGrow: 1,
    },
    itemTitle: [
        fonts.xLarge,
        {
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            textAlign: "left",
            display: "flex",
        },
    ],
    itemMessage: {
        textAlign: "left",
    },
    msgWrapper: {
        display: "flex",
    },
    msgText: {
        width: "50%",
    },
    search: {
        textAlign: "left",
        width: "50%",
    },
    msgEmpty: {
        textAlign: "left",
        width: "50%",
        paddingBottom: "10px",
    },
    spinnerWrapper: {
        display: "flex",
        paddingTop: "10px",
        paddingBottom: "10px",
    },
});

const ChatMessages = (props: IChatListProps): JSX.Element => {
    const configuration = new Configuration({
        organization: props.organization!,
        apiKey: props.apiKey!,
    });
    const openai = new OpenAIApi(configuration);

    const submitIcon: IIconProps = { iconName: "Send" };
    const [items, setItems] = React.useState(props.chatMessages ?? []);
    const [sendNewMessage, setSendNewMessage] = React.useState(false);
    const [textFieldValue, setTextFieldValue] = React.useState("");

    const userImageProps: Partial<IImageProps> = {
        src: "https://img.freepik.com/premium-vector/avatar-profile-icon_188544-4755.jpg",
        width: 32,
    };

    const gptImageProps: Partial<IImageProps> = {
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/1024px-ChatGPT_logo.svg.png",
        width: 32,
    };

    // useEffect(() => {
    //     if (props.chatMessages) {
    //         openai
    //             .createChatCompletion({
    //                 model: "gpt-3.5-turbo",
    //                 messages: props.chatMessages,
    //             })
    //             .then((response) => {
    //                 response.data.choices.forEach((choice) => {
    //                     setItems((items) => [...items, choice.message as ChatCompletionRequestMessage]);
    //                 });
    //             });
    //     }
    // }, [props.chatMessages]);

    useEffect(() => {
        if (items.length > 0 && sendNewMessage) {
            openai
                .createChatCompletion({
                    model: "gpt-3.5-turbo",
                    messages: items,
                })
                .then((response) => {
                    response.data.choices.forEach((choice) => {
                        setItems((items) => [...items, choice.message as ChatCompletionRequestMessage]);
                    });
                    props.relayUpdates(response.data.choices[0].message as ChatCompletionRequestMessage);
                    setSendNewMessage(false);
                });
        }
    }, [sendNewMessage]);

    const onFilterChanged = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, text?: string): void => {
        if (text) {
            setItems(items.filter((item) => item.content.toLowerCase().indexOf(text.toLowerCase()) >= 0));
        } else {
            setItems(props.chatMessages!);
        }
    };

    const onRenderCell = (item?: ChatCompletionRequestMessage, index?: number | undefined): JSX.Element => {
        if (!item) {
            return <></>;
        } else {
            return (
                <div className={classNames.itemCell} data-is-focusable={true}>
                    <div className={classNames.itemContent}>
                        <div className={classNames.itemTitle}>
                            {item?.role === "user" ? <Image {...userImageProps} alt={item?.role} className={classNames.itemImage} /> : <Image {...gptImageProps} alt={item?.role} className={classNames.itemImage} />}
                            {item?.role}
                        </div>
                        {/* <div className={classNames.itemIndex}>{`Item ${index}`}</div> */}
                        <div className={classNames.itemMessage}>{item?.content}</div>
                    </div>
                </div>
            );
        }
    };

    const onChangeTextFieldValue = React.useCallback((event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        setTextFieldValue(newValue || "");
    }, []);

    const sendToChatGPT = (): void => {
        const message: ChatCompletionRequestMessage = { role: "user", content: textFieldValue };
        setItems((items) => [...items, message]);
        setSendNewMessage(true);
        setTextFieldValue("");
        props.relayUpdates(message);
    };

    return (
        <FocusZone direction={FocusZoneDirection.vertical}>
            {items && items.length > 0 ? (
                <>
                    <TextField
                        className={classNames.search}
                        label={"Search"}
                        placeholder={"Search your content..."}
                        // eslint-disable-next-line react/jsx-no-bind
                        onChange={onFilterChanged}
                    />
                    <List items={items} onRenderCell={onRenderCell} />
                </>
            ) : (
                <div className={classNames.msgEmpty}>Ask your questions to Chat GPT</div>
            )}
            {sendNewMessage ? (
                <div className={classNames.spinnerWrapper}>
                    <Spinner label="Chat GPT is responding... Please wait..." ariaLive="assertive" labelPosition="left" />
                </div>
            ) : (
                <></>
            )}
            <div className={classNames.msgWrapper}>
                <TextField className={classNames.msgText} placeholder={"Type your message here"} value={textFieldValue} onChange={onChangeTextFieldValue} />
                <IconButton iconProps={submitIcon} title="Send" ariaLabel="Send" onClick={sendToChatGPT} />
            </div>
        </FocusZone>
    );
};

export default ChatMessages;
