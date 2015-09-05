import {pages} from './pages';


export default class RootComponent extends React.Component {

  render() {

    let props = {
      top: 'center',
      left: 'center',
      width: 82,
      height: 34,
      border: {
        type: 'line'
      },
      style: {
        fg: 'white',
        bg: 'blue',
        border: {
          fg: 'white'
        }
      },
      content: 'RootComponent!'
    };

    const ActivePageComponent = pages['welcome'];

    return (
      <box {...props}>
        <ActivePageComponent />
      </box>
    );
  }
}
