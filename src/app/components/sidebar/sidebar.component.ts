import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ChatGroupDto } from 'src/app/models/ChatGroupDto';
import { ConversationDto } from 'src/app/models/ConversationDto';
import { GroupChatInfoDto } from 'src/app/models/GroupChatInfoDto';
import { GroupListDto } from 'src/app/models/GroupListDto';
import { GroupWithMembershipDto } from 'src/app/models/GroupWithMembershipDto';
import { UserForChatInfo } from 'src/app/models/UserForChatInfoDto';
import { UserForProfileDto } from 'src/app/models/UserForProfileDTO';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { GroupService } from 'src/app/services/group.service';
import { MessageService } from 'src/app/services/message.service';
import { UserService } from 'src/app/services/user.service';
import { ChatService } from '../../services/hubservice.service';


@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  users: User[];
  @Input() receiverUserName:string;
  @Output() receiverUserNameChange = new EventEmitter<string>();
  senderUserName:string=this.authservice.decodedToken.unique_name;
  senderid:string=this.authservice.decodedToken.nameid;
  @Input() oldMessage:any[];
  @Output() oldMessageChange = new EventEmitter<any[]>();
  @Input() parentOldGroupMessage:any[];
  @Output() parentOldGroupChange = new EventEmitter<any[]>();
  lastMessages:ConversationDto[];
  @Input() userForChat:UserForChatInfo;
  @Output() userForChatChange = new EventEmitter<UserForChatInfo>();
  user:UserForProfileDto;
  @Input() groupName:string;
  @Output() groupNameChange = new EventEmitter<string>();
  groups:GroupWithMembershipDto[];
  @Output() userChatActiveClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() groupChatActiveClick: EventEmitter<any> = new EventEmitter<any>();
  @Input()  group:GroupChatInfoDto;
  @Output() groupForChatChange = new EventEmitter<GroupChatInfoDto>();
  lastGroupmessages:ChatGroupDto[];
  userForUpdateDTO: any = {};
  userid:number;
  userImg:File;
  @Input() onlineUser: string[] = [];
  @Output() onlineUserChange = new EventEmitter<string[]>();



  constructor(private userService: UserService,private messageService:MessageService,public authservice:AuthService,private groupService:GroupService,private chatService:ChatService) { }

  ngOnInit() {
    const userid=parseInt(this.senderid);
    const userName = this.senderUserName;
    this.messageService.getLastMessageByUserInGroups(userid)
      .subscribe(message => {
        this.lastGroupmessages = message;
      });

    this.messageService.getConversationsForUser(userName).subscribe(
      conversations => this.lastMessages = conversations,
      error => console.log(error)
    );
    this.userService.getAllUsers().subscribe(data => {
      this.users = data;
    });

    this.userService.getUserByUserName(userName).subscribe(
      (user: UserForProfileDto) => {
        this.user = user;
      },
      (error: any) => {
        console.error(error);
      }
    );

    this.groupService.getAllGroupsWithMembership(userid).subscribe((groups) => {
      this.groups = groups;
    });

    this.chatService.addUpdateGroupsListListener().subscribe(groups => {
      this.groups = groups;
    });


    this.chatService.getLastMessagesInGroupListener().subscribe((lastMessagesInGroup) => {
      this.lastGroupmessages = lastMessagesInGroup;

    });
    this.chatService.onReceiveUsernames((usernames: string[]) => {
      this.onlineUser = usernames;
      this.onlineUserChange.emit(this.onlineUser);

    });
  }

  selectUser(messsage: ConversationDto) {
    this.userService.getUserForChat(messsage.contactName).subscribe(user => {
      this.userForChat = user;
    });
    this.receiverUserName = messsage.contactName;
    this.receiverUserNameChange.emit(this.receiverUserName);
    this.messageService.getMessages(this.senderUserName, this.receiverUserName).subscribe(
      (response: any[]) => {
        this.oldMessage = response.map((message: any) => {
          return {
            text: message.text,
            dateSent: message.dateSent,
            senderUserName: message.senderUserName,
            senderFullName: message.senderFullName,
            type: (message.senderUserName === this.senderUserName) ? 0 : 1,
            filePath:message.filePath,
            fileType:message.fileType
          };
        });

        this.userForChatChange.emit(this.userForChat);
        this.oldMessageChange.emit(this.oldMessage);
        console.log(response);
      },
      (error) => console.log(error)

    );

  };

  choseUser(user: User) {
    this.userService.getUserForChat(user.userName).subscribe(user => {
      this.userForChat = user;
      this.userForChatChange.emit(this.userForChat);
    });
    this.receiverUserName = user.userName;
    this.receiverUserNameChange.emit(this.receiverUserName);
    this.messageService.getMessages(this.senderUserName, this.receiverUserName).subscribe(
      (response: any[]) => {
        this.oldMessage = response.map((message: any) => {
          return {
            text: message.text,
            dateSent: message.dateSent,
            senderUserName: message.senderUserName,
            senderFullName: message.senderFullName,
            type: (message.senderUserName === this.senderUserName) ? 0 : 1,
            filePath:message.filePath,
            fileType:message.fileType
          };
        });
        this.oldMessageChange.emit(this.oldMessage);

      },
      (error) => console.log(error)
    );

    setTimeout(() => {

    }, 400);

  }

  choseGroup(group:ChatGroupDto){
    this.groupService.getGroupsByGroupName(group.groupName).subscribe((data) => {
      this.group =data
      this.groupForChatChange.emit(this.group);
    });
    this.groupName = group.groupName;
    this.groupNameChange.emit(this.groupName);
  this.messageService.getGroupMessages(group.groupName).subscribe(
    (response: any[]) => {
      this.parentOldGroupMessage = response.map((message: any) => {
        return {
          text: message.text,
          dateSent: message.dateSent,
          senderUserName: message.senderUserName,
          senderFullName: message.senderFullName,
          type: (message.senderUserName === this.senderUserName) ? 0 : 1,
          filePath:message.filePath,
          fileType:message.fileType
        };
      });
      this.parentOldGroupChange.emit(this.parentOldGroupMessage);

    },
    (error) => console.log(error)
  );


  }

  selectGroup(group:GroupListDto){
    this.groupService.getGroupsByGroupName(group.groupName).subscribe((data) => {
        this.group =data
        this.groupForChatChange.emit(this.group);
      });
      this.groupName = group.groupName;
    this.groupNameChange.emit(this.groupName);
    this.messageService.getGroupMessages(group.groupName).subscribe(
      (response: any[]) => {
        this.parentOldGroupMessage = response.map((message: any) => {
          return {
            text: message.text,
            dateSent: message.dateSent,
            senderUserName: message.senderUserName,
            senderFullName: message.senderFullName,
            type: (message.senderUserName === this.senderUserName) ? 0 : 1,
            filePath:message.filePath,
            fileType:message.fileType
          };
        });
        this.parentOldGroupChange.emit(this.parentOldGroupMessage);

      },
      (error) => console.log(error)
    );
   console.log(group);
   console.log(this.group);
  }

  joinGroup(groupName:string): void {
    this.chatService.joinGroup(groupName).subscribe(() => {

    });
    }

  userActive(){
    this.userChatActiveClick.emit();
  }

  groupActive(){
   this.groupChatActiveClick.emit();

  }

  createGroup(groupName: string) {
    if (this.groupName) {
      this.chatService.createGroup(groupName);
    }
  }


  onSubmit() {
    this.userid=parseInt(this.senderid);
    this.userService.updateUser(this.userid, this.userForUpdateDTO,this.userImg).subscribe(() => {
    location.reload();
    }, error => {
     console.log(error);
    });
    console.log("çalıştı");
    }

    onprofilImageSelected(event:Event){
      const file = (event.target as HTMLInputElement).files[0];
      this.userImg = file;
    }

    isActiveUser(username: string): boolean {

      return this.onlineUser.includes(username);
    }

}
