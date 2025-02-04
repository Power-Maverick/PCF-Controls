# Flexible Ordering List Control

[![GitHub Releases](https://img.shields.io/static/v1?label=Download&message=Flexible%20Ordering%20Grid&style=for-the-badge&logo=microsoft&color=brightgreen)](https://github.com/Power-Maverick/PCF-Controls/releases/tag/FlexOrderGrid-v.1.0.17)

A fully configurable PCF dataset control that helps the user sets their own ordering on the records by using drag & drop feature. It has auto-save as well as manual save feature.

## Configure the control

Control has 2 configuration property. One is on the sub-grid named `Order Column` that is required and is used for setting the order of the records. The second property is a choice that allows to configure the grid/view which will auto-save the ordering when user moves the records around or manual which will display a **Save** button (auto-save is the default). The latter will not save until user clicks on the **Save** button and if user navigates away from the screen without saving there will be no prompt and all changes will be lost.

## Screenshot of the configuration

![FlexOrderGrid-Configuration](Assets/Control-Configuration.png)

## Demo of the control

#### With Auto-Save Enabled

![FlexOrderGrid-AutoSave](Assets/FlexOrderingGrid-WithAutoSave.gif)

#### With Manual-Save Enabled

![FlexOrderGrid-ManualSave](Assets/FlexOrderingGrid-WithManualSave.gif)
