/* eslint global-require: 0*/
import React from 'react';
import PropTypes from 'prop-types';
import rimraf from 'rimraf';
import { localized } from 'mailspring-exports';
import ConfigSchemaItem from './config-schema-item';
import WorkspaceSection from './workspace-section';
import SendingSection from './sending-section';
import LanguageSection from './language-section';
import { ConfigLike, ConfigSchemaLike } from '../types';


class PreferencesGeneral extends React.Component<{
  config: ConfigLike;
  configSchema: ConfigSchemaLike;
}> {
  static displayName = 'PreferencesGeneral';

  static propTypes = {
    config: PropTypes.object,
    configSchema: PropTypes.object,
  };

  _onReboot = () => {
    const app = require('@electron/remote').app;
    app.relaunch();
    app.quit();
  };

  _onResetEmailsThatIgnoreWarnings = () => {
    localStorage.removeItem("recipientWarningBlacklist");
  }

  _onResetAccountsAndSettings = () => {
    const chosen = require('@electron/remote').dialog.showMessageBoxSync({
      type: 'info',
      message: localized('Are you sure?'),
      buttons: [localized('Cancel'), localized('Reset')],
    });

    if (chosen === 1) {
      rimraf(AppEnv.getConfigDirPath(), { disableGlob: true }, err => {
        if (err) {
          return AppEnv.showErrorDialog(
            localized(
              `Could not reset accounts and settings. Please delete the folder %@ manually.\n\n%@`,
              AppEnv.getConfigDirPath(),
              err.toString()
            )
          );
        }
        this._onReboot();
      });
    }
  };

  _onResetEmailCache = () => {
    const ipc = require('electron').ipcRenderer;
    ipc.send('command', 'application:reset-database', {});
  };


  render() {
    return (
      <div className="container-general">
        <div className="two-columns-flexbox">
          <div style={{ flex: 1 }}>
            <WorkspaceSection config={this.props.config} configSchema={this.props.configSchema} />
            <LanguageSection config={this.props.config} configSchema={this.props.configSchema} />
          </div>
          <div style={{ width: 30 }} />
          <div style={{ flex: 1 }}>
            <ConfigSchemaItem
              configSchema={this.props.configSchema.properties.reading}
              keyName={localized('Reading')}
              keyPath="core.reading"
              config={this.props.config}
            />
          </div>
        </div>
        <div className="two-columns-flexbox" style={{ paddingTop: 30 }}>
          <div style={{ flex: 1 }}>
            <SendingSection config={this.props.config} configSchema={this.props.configSchema} />
            <div className="btn" onClick={this._onResetEmailsThatIgnoreWarnings} style={{ marginLeft: 0, marginTop:5 }}>
              {localized('Reset Emails that Ignore Warnings')}
            </div>
          </div>
          <div style={{ width: 30 }} />
          <div style={{ flex: 1 }}>
            <ConfigSchemaItem
              configSchema={this.props.configSchema.properties.composing}
              keyName={localized('Composing')}
              keyPath="core.composing"
              config={this.props.config}
            />
          </div>
        </div>

        <div className="two-columns-flexbox" style={{ paddingTop: 30 }}>
          <div style={{ flex: 1 }}>
            <ConfigSchemaItem
              configSchema={this.props.configSchema.properties.notifications}
              keyName={localized('Notifications')}
              keyPath="core.notifications"
              config={this.props.config}
            />
            <div className="platform-note platform-linux-only">
              {localized(
                'Mailspring desktop notifications on Linux require Zenity. You may need to install it with your package manager.'
              )}
            </div>
          </div>
          <div style={{ width: 30 }} />
          <div style={{ flex: 1 }}>
            <ConfigSchemaItem
              configSchema={this.props.configSchema.properties.attachments}
              keyName={localized('Attachments')}
              keyPath="core.attachments"
              config={this.props.config}
            />
          </div>
        </div>

        <div className="local-data">
          <h6>{localized('Local Data')}</h6>
          <div className="btn" onClick={this._onResetEmailCache} style={{ marginLeft: 0 }}>
            {localized('Reset Cache')}
          </div>
          <div className="btn" onClick={this._onResetAccountsAndSettings}>
            {localized('Reset Accounts and Settings')}
          </div>
        </div>
      </div>
    );
  }
}

export default PreferencesGeneral;
