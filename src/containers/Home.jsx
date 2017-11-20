/* global browser: false, confirm: false */
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { isJSON } from '../utils/file';
import { getMessage } from '../utils/i18n';
import Confirm from '../components/Confirm';

 class Home extends React.Component {
  static canOpenSidebar() {
    return browser.sidebarAction && browser.sidebarAction.open;
  }
  menus() {
    let menus = [];
    switch (this.props.info.os) {
      case 'android':
        menus.push('list');
        break;
      default:
        menus.push('list');
        if (Home.canOpenSidebar()) {
          menus.push('sidebar');
        }
        menus = menus.concat(['toggle', 'create']);
        break;
    }
    if (this.props.user) {
      menus = menus.concat(['sync', 'logout', 'clear-cache']);
    } else {
      menus = menus.concat(['login']);
    }
    return menus;
  }
  render() {
    return (
      <div>
        <div className="home">
          <ul className="ul">
            {this.menus().map(m => (
              <li className="li" key={m}>
                <a
                  className="menuItem"
                  onClick={() => this.props.handleClick(m, this.filePicker)}
               >
                 {getMessage(m)}
               </a>
             </li>
             ))}
          </ul>
          <input
            ref={(input) => { this.filePicker = input; }}
            type="file"
            style={{ position: 'fixed', top: 10, display: 'none' }}
            onChange={e => this.props.handleInputFiles(e.target.files)}
          />
        </div>
        <Confirm
          hidden={!this.props.confirm}
          title={getMessage('clear-cache')}
          message={getMessage('clear-cache.confirmMessage')}
          onSubmit={result => this.props.handleConfirm(result)}
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    info:    state.info,
    user:    state.user,
    confirm: state.confirm,
  };
}

function mapDispatchToProps(dispatch, { history }) {
  return {
    handleClick: (menu, filePicker) => {
      switch (menu) {
        case 'login':
          history.push('/login');
          break;
        case 'import':
          filePicker.click();
          break;
        case 'sidebar':
          browser.sidebarAction.open();
          break;
        case 'clear-cache':
          dispatch({ type: 'CONFIRM_CLEAR_CACHE' });
          break;
        default:
          dispatch({ type: 'MENU', payload: { name: menu } });
          break;
      }
    },
    handleConfirm: (result) => {
      if (result) {
        dispatch({ type: 'MENU', payload: { name: 'clear-cache' }});
      }
      dispatch({ type: 'HIDE_CONFIRM' });
    },
    handleInputFiles: (files) => {
      dispatch({ type: 'IMPORT', payload: [] });
      for (let i = 0; i < files.length; i += 1) {
        const file = files[i];
        dispatch({ type: 'IMPORT', payload: [] });
        if (isJSON(file)) {
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const data = JSON.parse(reader.result);
              dispatch({ type: 'IMPORT', payload: data });
            } catch (e) {
              dispatch({ type: 'IMPORT_FAIL', payload: e });
            }
          };
          reader.readAsText(file);
        }
      }
    },
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Home));
