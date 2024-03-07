import React from "react";
import { connect } from "react-redux";
import { Tabs, Layout, Spin } from "antd";
const { Content, Sider } = Layout;

import Header from "../../components/Header/Header.js";
import View from "../Project/Interface/InterfaceList/View.js";
import { setBreadcrumb } from "../../reducer/modules/user";
import { getProject } from "../../reducer/modules/project.js";
import { fetchInterfaceData } from "../../reducer/modules/interface.js";
import { setCurrGroup } from "../../reducer/modules/group.js";

@connect(
  (state) => {
    return {
      loginState: state.user.loginState,
      curProject: state.project.currProject,
      currGroup: state.group.currGroup,
      curData: state.inter.curdata,
    };
  },
  {
    setBreadcrumb,
    fetchInterfaceData,
    getProject,
    setCurrGroup,
  }
)
class Share extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
    };
  }

  async componentWillMount() {
    this.setState({ loading: true });
    await this.props.fetchInterfaceData(this.props.match.params.id);

    await this.props.getProject(this.props.curData.project_id);

    await this.props.setCurrGroup({ _id: this.props.curProject.group_id });

    this.props.setBreadcrumb([
      { name: "分享" },
      {
        name: this.props.curData.title,
        href: `project/${this.props.curData.project_id}/interface/api/${this.props.curData._id}`,
      },
    ]);

    console.log(this.props.match.params.id);

    this.setState({ loading: false });
  }

  render() {
    return (
      <Layout>
        <Content
          style={{
            height: "100%",
            margin: "24px",
            overflow: "initial",
            backgroundColor: "#fff",
          }}
        >
          <div className="right-content">
            <Spin spinning={this.state.loading}>
              {this.props.loginState !== 1 ? null : <Header />}
              {this.state.loading ? "" : <View></View>}
            </Spin>
          </div>
        </Content>
      </Layout>
    );
  }
}

export default Share;
