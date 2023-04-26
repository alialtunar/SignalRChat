import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ChatService } from '../../services/hubservice.service';

import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { Message } from 'src/app/models/message';
import { UserForChatInfo } from 'src/app/models/UserForChatInfoDto';
import { GroupChatInfoDto } from 'src/app/models/GroupChatInfoDto';
import { UserForProfileDto } from 'src/app/models/UserForProfileDTO';
import { UserService } from 'src/app/services/user.service';
import { MessageService } from 'src/app/services/message.service';
import { GroupService } from 'src/app/services/group.service';
import { GroupUserDto } from 'src/app/models/GroupUserDto';




@Component({
  selector: 'app-chatpage',
  templateUrl: './chatpage.component.html',
  styleUrls: ['./chatpage.component.scss']
})
export class ChatpageComponent implements OnInit {


  messages: { senderUserName: string, message: string,DateSent: Date, type: number }[] = [];

  public errorMessage: any;
  users: any;
  @ViewChild('myTextarea') myTextareaRef!: ElementRef;
  receiverUserName: string;
  senderUserName:string=this.authService.decodedToken.unique_name;
  message:string;
  parentOldMessage: any[] = [];
  userForChat:UserForChatInfo;
  groupName:string;
  @ViewChild('myGroupTextarea') myGroupTextarea!: ElementRef;
  messageGroup:string="grup mesajı";
  parentOldGroupMessage: any[] = [];
  group:any;
  otheruser:UserForProfileDto;
  page=1;
  pageGroup=1;
  file:File;
  fileToGroup:File;
  groupInfo: GroupUserDto[];
  writingUser:string[]=[];
  parentOnlineUser: string[] = [];


  constructor(private chatService: ChatService, private authService: AuthService,private userService:UserService,private messageService:MessageService,private groupService:GroupService) {

   }

  ngOnInit() {

    this.chatService.receiveMessage().subscribe((data: any) => {
      const newMessage = { senderUserName: data.senderUserName, text: data.message, dateSent: data.DateSent, type: 1,filePath:data.filePath,fileType:data.fileType };
      this.parentOldMessage.push(newMessage);

      this.scrooldown();
    });
    this.chatService.receiveFile().subscribe(file => {
      const newMessage = { senderUserName: file.senderUserName, text:'', dateSent: file.dateSent, type: 1,filePath:file.filePath,fileType:file.fileType };
      this.parentOldMessage.push(newMessage);

      this.scrooldown();

    });

    this.chatService.receiveFileFromGroup().subscribe(file => {
      if(file.senderUserName==this.senderUserName){}
      else{
        const newMessageToGroup = { senderUserName: file.senderUserName, text:'', dateSent: file.dateSent, type: 1,filePath:file.filePath,fileType:file.fileType };
        this.parentOldGroupMessage.push(newMessageToGroup);

        this.scrooldown();

      }
    });



    this.chatService.errorMessage().subscribe((errorMessage) => {
      this.errorMessage = errorMessage;
      console.log(this.errorMessage);


    });

    this.chatService.receiveMessageGroup().subscribe((data: any) => {
      const newGroupMessage = { senderUserName: data.fullName, text: data.message,dateSent:data.dateSent, type: 1,filePath:data.filePath,fileType:data.fileType };
      this.parentOldGroupMessage.push(newGroupMessage);
      this.scrooldown();
      });

      this.chatService.receiveWrite().subscribe((data: any) => {
        if(this.writingUser.includes(data.senderUserName)){

        }
        else{
          this.writingUser.push(data.senderUserName);
          console.log(this.writingUser);
          console.log(data.senderUserName + "yazıyor");
        }

      });

      this.chatService.receiveOnFocusWrite().subscribe((data: any) => {
        const index = this.writingUser.indexOf(data.senderUserName); // silmek istediğiniz değerin dizideki indeksini bulun
        if (index !== -1) {
          this.writingUser.splice(index, 1); // splice() yöntemi ile diziden 1 elemanı (değeri) silin
        }

    });


  }

  public sendMessage() {
    this.message=this.myTextareaRef.nativeElement.value;
    this.chatService.sendMessage(this.receiverUserName, this.message).then(()=>{
      this.scrooldown();
      const myMessage = { text: this.message, dateSent: new Date(),type: 0, };
      this.parentOldMessage.push(myMessage);
    });


}

  otherUser(user:UserForChatInfo){
  this.userService.getUserByUserName(user.userName).subscribe(
    (user: UserForProfileDto) => {
      this.otheruser = user;
    },
    (error: any) => {
      console.error(error);
    }
  );
  }

  SendFile() {
    // Dosyayı yükleme metodunu çağır
    this.messageService.sendFile(this.receiverUserName,this.senderUserName, this.file).subscribe(
      (response) => {
        this.scrooldown();
        const myMessage = {text:response.text, dateSent: new Date(),type: 0,filePath:response.filePath,fileType:response.fileType };
        this.parentOldMessage.push(myMessage);

      },
      (error) => {
        // Hata durumunda yanıtı işle
        console.error('Dosya yüklenirken hata oluştu', error);
      }
    );
  }

  SendFileToGroup() {
    // Dosyayı yükleme metodunu çağır
    this.messageService.sendFileToGroup(this.groupName,this.senderUserName, this.fileToGroup).subscribe(
      (response) => {
        this.scrooldown();
        const myGroupMessage = {text:'', dateSent: new Date(),type: 0,filePath:response.filePath,fileType:response.fileType };
        this.parentOldGroupMessage.push(myGroupMessage);

      },
      (error) => {
        // Hata durumunda yanıtı işle
        console.error('Dosya yüklenirken hata oluştu', error);
      }
    );
  }

  uploadFile() {
    // Dosyayı yükleme metodunu çağır
    this.chatService.sendFile(this.receiverUserName, this.file).then(
      (response) => {
        // Başarılı yanıtı işle
        console.log('Dosya yüklendi', response);
      },
      (error) => {
        // Hata durumunda yanıtı işle
        console.error('Dosya yüklenirken hata oluştu', error);
      }
    );
  }

  onReceiverUserNameChange(receiverUserName: string) {
    this.receiverUserName = receiverUserName;
  }

  ongroupNameChange(groupName: string) {
    this.groupName = groupName;
  }

  onUserForChatChange(event: UserForChatInfo) {
    this.userForChat = event;
  }

  onGroupForChatChange(event: GroupChatInfoDto) {
    this.group = event;
    console.log(this.group);
  }

  onOldMessageChange(event: any[]) {
    this.parentOldMessage = event;
    this.scrooldown();
   console.log(this.parentOldMessage);
  }

  onparentOldMessageChange(event: any[]) {
    this.parentOldGroupMessage = event;
    this.scrooldown();
    console.log(this.parentOldGroupMessage);
  }

  joinGroup(): void {
    this.chatService.joinGroup(this.groupName).subscribe(() => {
    console.log('Joined group: ${this.groupName}');
    });
    }

    leaveGroup(): void {
    this.chatService.leaveGroup(this.groupName).subscribe(() => {
    console.log("Left group: ${this.groupName}");
    this.chatGroupClose()
    });
    }

    sendMessagetoGroup(): void {
      this.messageGroup=this.myGroupTextarea.nativeElement.value;
    this.chatService.addMessageToGroup(this.groupName, this.messageGroup).subscribe(() => {
      this.scrooldown();
    });
    const myGroupMessage = { senderUserName: this.receiverUserName, text: this.messageGroup, dateSent: new Date(),type: 0 };
    this.parentOldGroupMessage.push(myGroupMessage);
    }


 scrooldown(){
  setTimeout(() => {
    const chatContent = document.getElementById('chat-content');
    chatContent.scrollTop = chatContent.scrollHeight;
  }, 400);
 }

  chatUserActive(){
    document.getElementById("chat-content").classList.add("open");
   var chatactive = document.getElementById("chatUser").classList.contains("active");
   if(chatactive){

   }else{
    document.getElementById("chatUser").classList.add("active");
     document.getElementById("chatUser").classList.add("show");
   }
   var chatgroupactive = document.getElementById("chatGroup").classList.contains("active");
   if(chatgroupactive){
    document.getElementById("chatGroup").classList.remove("active");
    document.getElementById("chatGroup").classList.remove("show");
   }



  }

  chatGroupActive(){
    document.getElementById("chat-content").classList.add("open");
    var chatactive = document.getElementById("chatGroup").classList.contains("active");
    if(chatactive){

    }else{
     document.getElementById("chatGroup").classList.add("active");
     document.getElementById("chatGroup").classList.add("show");
    }
    var chatgroupactive = document.getElementById("chatUser").classList.contains("active");
    if(chatgroupactive){
     document.getElementById("chatUser").classList.remove("active");
     document.getElementById("chatUser").classList.remove("show");
    }


   }

   chatGroupClose(){
    var chatactive = document.getElementById("chatGroup").classList.contains("active");
    if(chatactive){
      document.getElementById("chatGroup").classList.remove("active");
    }

    }

    chatUserClose(){
      var chatactive = document.getElementById("chatUser").classList.contains("active");
      if(chatactive){
        document.getElementById("chatUser").classList.remove("active");
      }

      }


      getOldMessages(){
        ++this.page;
        this.messageService.getMessages(this.senderUserName, this.receiverUserName,this.page).subscribe(
          (response: any[]) => {
            var newMessage = response.map((message: any) => {
              return {
                text: message.text,
                dateSent: message.dateSent,
                senderUserName: message.senderUserName,
                senderFullName: message.senderFullName,
                type: (message.senderUserName === this.senderUserName) ? 0 : 1
              };
            });
            this.parentOldMessage = [...newMessage, ...this.parentOldMessage];

          },
          (error) => console.log(error)
        );
      }

     getOldGroupMessages(){
      ++this.pageGroup;
      this.messageService.getGroupMessages(this.group[0].groupName,this.pageGroup).subscribe(
        (response: any[]) => {
          var newGroupMessage = response.map((message: any) => {
            return {
              text: message.text,
              dateSent: message.dateSent,
              senderUserName: message.senderUserName,
              senderFullName: message.senderFullName,
              type: (message.senderUserName === this.senderUserName) ? 0 : 1
            };
          });
          this.parentOldGroupMessage = [...newGroupMessage, ...this.parentOldGroupMessage];


        },
        (error) => console.log(error)
      );
     }


    // component.ts
    onfileSelected(event: Event) {
  const file = (event.target as HTMLInputElement).files[0];
  if (file) {
    this.file = file;
   this.SendFile();
  }
}

onfileSelectedToGroup(event: Event) {
  const file = (event.target as HTMLInputElement).files[0];
  if (file) {
    this.fileToGroup = file;
   this.SendFileToGroup();
  }
}

loadGroupUsers(): void {
 // Çağrılacak grup adı
  this.groupService.getGroupUsers(this.groupName)
    .subscribe(
      groupUsers => {
        this.groupInfo = groupUsers;
      },
      error => {
        console.error('Grup kullanıcıları alınırken bir hata oluştu: ', error);
      }
    );
    console.log(this.groupInfo);
}

chanceWrite(){
    this.chatService.chanceWrite(this.receiverUserName).then(()=>{
    });
}

onFocusWrite(){
  this.chatService.onFocusWrite(this.receiverUserName).then(()=>{
  });
}

closeChat(){
  document.getElementById("chat-content").classList.remove("open");
}

isWriting(userName:string): boolean {
  return this.writingUser.includes(userName);
}

isActiveUser(username: string): boolean {

  return this.parentOnlineUser.includes(username);
}

onOnlineUserChange(event: any[]) {
  this.parentOnlineUser = event;
}
   }




