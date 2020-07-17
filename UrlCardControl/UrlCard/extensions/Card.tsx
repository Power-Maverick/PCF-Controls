import * as React from "react";
import { Card, ICardTokens, ICardSectionStyles, ICardSectionTokens } from '@uifabric/react-cards';
import { FontWeights } from '@uifabric/styling';
import { Icon, IIconStyles, Image, Stack, IStackTokens, Text, ITextStyles } from 'office-ui-fabric-react';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { initializeIcons } from "office-ui-fabric-react/lib/Icons";

initializeIcons(undefined, { disableWarnings: true });

export interface ICardProps {
    title?: string;
    description?: string;
    image?: string;
    domain?: string;
    urlText?: string;
    label?: string;
    isRequired?: boolean;
    errorMessage?: string;

    triggerOnChange?: (event: any, newValue?: string) => void;
    triggerOnClick?: () => void;
}

export interface ICardState extends React.ComponentState {
}

export class CardHorizontalExample extends React.Component<ICardProps, ICardState> {

    constructor(props: ICardProps) {
        super(props);

        this.state = {
            title: props.title || "No title available",
            description: props.description || "No description available",
            image: props.image || "N/A",
            domain: props.domain || "",
            url: props.urlText || "",
            label: props.label || "Url",
            isRequired: props.isRequired || false,
            errorMessage: props.errorMessage || "",

            onChange: props.triggerOnChange,
            onClick: props.triggerOnClick,
        };
    }

    public componentWillReceiveProps(newProps: ICardProps): void {
        this.setState(newProps);
    }

    public render(): JSX.Element {
        const siteTextStyles: ITextStyles = {
            root: {
                color: '#025F52',
                fontWeight: FontWeights.semibold,
            },
        };
        const descriptionTextStyles: ITextStyles = {
            root: {
                color: '#333333',
                fontWeight: FontWeights.regular,
            },
        };
        const helpfulTextStyles: ITextStyles = {
            root: {
                color: '#333333',
                fontWeight: FontWeights.regular,
            },
        };
        const iconStyles: IIconStyles = {
            root: {
                color: '#0078D4',
                fontSize: 16,
                fontWeight: FontWeights.regular,
            },
        };
        const footerCardSectionStyles: ICardSectionStyles = {
            root: {
                alignSelf: 'stretch',
                borderLeft: '1px solid #F3F2F1',
            },
        };

        const sectionStackTokens: IStackTokens = { childrenGap: 20 };
        const cardTokens: ICardTokens = { childrenMargin: 12 };
        const footerCardSectionTokens: ICardSectionTokens = { padding: '0px 0px 0px 12px' };
        const iconProps = { iconName: 'Globe' };

        return (
            <Stack tokens={sectionStackTokens} className="mainStack">
                <TextField // prettier-ignore
                    label={this.state.label}
                    ariaLabel={this.state.label}
                    iconProps={iconProps}
                    required={this.state.isRequired}
                    errorMessage={this.state.errorMessage}
                    onChange={this.state.onChange}
                    defaultValue={this.state.url}
                />
                <Card aria-label="URL Card" horizontal onClick={this.state.onClick} tokens={cardTokens}>
                    <Card.Item fill className="imageCardItem">
                        <Image src={this.state.image} alt="Image" className="imageItem" />
                    </Card.Item>
                    <Card.Section>
                        <Text variant="large" styles={siteTextStyles}>
                            {this.state.title}
                        </Text>
                        <Text styles={descriptionTextStyles}>
                            {this.state.description}
                        </Text>
                        <Text variant="small" styles={helpfulTextStyles}>
                            {this.state.domain}
                        </Text>
                    </Card.Section>
                    <Card.Section styles={footerCardSectionStyles} tokens={footerCardSectionTokens}>
                        <Icon iconName="NavigateExternalInline" styles={iconStyles} />
                    </Card.Section>
                </Card>
            </Stack>
        );
    }
}